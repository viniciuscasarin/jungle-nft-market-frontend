import { http, HttpResponse, type HttpResponseResolver } from 'msw';
import { type ZodType, type ZodTypeDef } from 'zod';
import {
  ApiErrorCode,
  type ApiErrorPayload,
  type Session,
} from '@nft/shared-contracts';
import {
  getNetworkProfile,
  matchesRule,
  executeBehavior,
  resolveLatencyMs,
  delay,
} from './network-profile';
import { getMockDatabase } from './database';
import { getClock } from './clock';

export function apiPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `*/api${normalized}`;
}


export function mapErrorCodeToStatus(code: ApiErrorCode | string): number {
  switch (code) {
    case ApiErrorCode.VALIDATION_ERROR:
      return 422;
    case ApiErrorCode.UNAUTHENTICATED:
    case ApiErrorCode.SESSION_EXPIRED:
      return 401;
    case ApiErrorCode.FORBIDDEN:
      return 403;
    case ApiErrorCode.NOT_FOUND:
      return 404;
    case ApiErrorCode.CONFLICT:
    case ApiErrorCode.AVAILABILITY_CONFLICT:
    case ApiErrorCode.PRICE_CHANGED:
    case ApiErrorCode.IDEMPOTENCY_CONFLICT:
      return 409;
    case ApiErrorCode.TRANSIENT:
      return 503;
    default:
      return 500;
  }
}

export interface ApiErrorOptions {
  message?: string;
  status?: number;
  retryable?: boolean;
  fieldErrors?: Record<string, string>;
  details?: unknown;
}

export function apiError(code: ApiErrorCode | string, options: ApiErrorOptions = {}): Response {
  const status = options.status ?? mapErrorCodeToStatus(code);
  const defaultMessages: Record<string, string> = {
    [ApiErrorCode.VALIDATION_ERROR]: 'Dados de requisição inválidos.',
    [ApiErrorCode.UNAUTHENTICATED]: 'Autenticação necessária para acessar este recurso.',
    [ApiErrorCode.SESSION_EXPIRED]: 'Sessão expirada. Faça login novamente.',
    [ApiErrorCode.FORBIDDEN]: 'Acesso negado.',
    [ApiErrorCode.NOT_FOUND]: 'Recurso não encontrado.',
    [ApiErrorCode.CONFLICT]: 'Conflito de estado ao processar recurso.',
    [ApiErrorCode.TRANSIENT]: 'Serviço temporariamente indisponível. Tente novamente.',
  };

  const payload: ApiErrorPayload = {
    code,
    message: options.message ?? defaultMessages[code] ?? 'Ocorreu um erro no servidor.',
    retryable: options.retryable ?? (status >= 500 || code === ApiErrorCode.TRANSIENT),
    fieldErrors: options.fieldErrors,
    details: options.details,
  };

  return HttpResponse.json(payload, { status });
}

export async function parseBody<T, Input>(
  request: Request,
  schema: ZodType<T, ZodTypeDef, Input>
): Promise<{ success: true; data: T } | { success: false; response: Response }> {
  try {
    const raw = await request.json();
    const result = schema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        if (path) {
          fieldErrors[path] = issue.message;
        }
      }
      return {
        success: false,
        response: apiError(ApiErrorCode.VALIDATION_ERROR, {
          message: 'Erro de validação nos campos informados.',
          fieldErrors,
          status: 422,
        }),
      };
    }
    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: apiError(ApiErrorCode.VALIDATION_ERROR, {
        message: 'Corpo da requisição deve ser um JSON válido.',
        status: 422,
      }),
    };
  }
}

export function requireSession(request: Request): {
  session: Session | null;
  response: Response | null;
} {
  const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      session: null,
      response: apiError(ApiErrorCode.UNAUTHENTICATED, {
        message: 'Token de autenticação ausente ou malformado.',
        status: 401,
      }),
    };
  }

  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  const db = getMockDatabase();
  const session = db.sessions.find((s) => s.token === token);

  if (!session) {
    return {
      session: null,
      response: apiError(ApiErrorCode.UNAUTHENTICATED, {
        message: 'Sessão inválida ou não encontrada.',
        status: 401,
      }),
    };
  }

  const expiresTime = new Date(session.expiresAt).getTime();
  if (expiresTime <= getClock().nowMs()) {
    return {
      session: null,
      response: apiError(ApiErrorCode.SESSION_EXPIRED, {
        message: 'Sessão expirada. Efetue login novamente.',
        status: 401,
        retryable: false,
      }),
    };
  }

  return { session, response: null };
}

export interface PaginationParams {
  page?: number | string;
  pageSize?: number | string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function paginate<T>(items: readonly T[], params: PaginationParams = {}): PaginatedResult<T> {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 12);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedSlice = items.slice(start, end);

  return {
    items: [...paginatedSlice],
    page,
    pageSize,
    total,
    totalPages,
  };
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export function defineHandler(
  method: HttpMethod,
  path: string,
  resolver: HttpResponseResolver
) {
  const targetPath = apiPath(path);
  const httpMethod = method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';

  return http[httpMethod](targetPath, async (info) => {
    const profile = getNetworkProfile();
    const url = new URL(info.request.url);
    const pathname = url.pathname;

    // Apply default profile latency if specified
    if (profile.defaultLatencyMs) {
      const ms = resolveLatencyMs(profile.defaultLatencyMs);
      await delay(ms);
    }

    // Phase: BEFORE
    for (const rule of profile.rules) {
      if (matchesRule(rule, 'before', method, pathname)) {
        const interceptResponse = await executeBehavior(rule.behavior, info.request.signal);
        if (interceptResponse) {
          return interceptResponse;
        }
      }
    }

    // Execute domain resolver
    const domainResponse = await resolver(info);

    // Phase: AFTER
    for (const rule of profile.rules) {
      if (matchesRule(rule, 'after', method, pathname)) {
        const interceptResponse = await executeBehavior(rule.behavior, info.request.signal);
        if (interceptResponse) {
          return interceptResponse;
        }
      }
    }

    return domainResponse;
  });
}

export const mocksPingHandler = defineHandler('GET', '/__mocks/ping', () => {
  const db = getMockDatabase();
  return HttpResponse.json({
    status: 'ok',
    scenarioId: db.scenarioId,
    version: db.version,
    persistenceDegraded: db.metadata.persistenceDegraded,
    timestamp: new Date().toISOString(),
  });
});

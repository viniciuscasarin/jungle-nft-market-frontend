import { z } from 'zod';

export const EnvSchema = z.object({
  VITE_ENABLE_MOCKS: z
    .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
    .default('true')
    .transform(val => (typeof val === 'boolean' ? val : val === 'true' || val === '1')),
  VITE_DEFAULT_SCENARIO: z.string().default('default'),
  VITE_API_BASE_URL: z
    .string({ required_error: 'VITE_API_BASE_URL é obrigatória' })
    .min(1, 'VITE_API_BASE_URL é obrigatória'),
  VITE_SOCKET_URL: z
    .string({ required_error: 'VITE_SOCKET_URL é obrigatória' })
    .min(1, 'VITE_SOCKET_URL é obrigatória'),
  VITE_REMOTE_STOREFRONT_URL: z
    .string({ required_error: 'VITE_REMOTE_STOREFRONT_URL é obrigatória' })
    .url('VITE_REMOTE_STOREFRONT_URL deve ser uma URL válida'),
  VITE_REMOTE_CHECKOUT_URL: z
    .string({ required_error: 'VITE_REMOTE_CHECKOUT_URL é obrigatória' })
    .url('VITE_REMOTE_CHECKOUT_URL deve ser uma URL válida'),
  VITE_REMOTE_ACCOUNT_URL: z
    .string({ required_error: 'VITE_REMOTE_ACCOUNT_URL é obrigatória' })
    .url('VITE_REMOTE_ACCOUNT_URL deve ser uma URL válida'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export class EnvValidationError extends Error {
  readonly missingOrInvalidKeys: string[];

  constructor(issues: z.ZodIssue[]) {
    const errorDetails = issues
      .map(issue => `  - ${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join('\n');
    super(
      `[EnvValidationError] Variáveis de ambiente obrigatórias ausentes ou inválidas:\n${errorDetails}\nConsulte o arquivo .env.example para configurar o ambiente.`,
    );
    this.name = 'EnvValidationError';
    this.missingOrInvalidKeys = issues.map(issue => String(issue.path[0]));
  }
}

export function validateEnv(rawEnv?: Record<string, unknown>): EnvConfig {
  const envToValidate =
    rawEnv ??
    (typeof process !== 'undefined' && process.env ? process.env : {});

  const result = EnvSchema.safeParse(envToValidate);
  if (!result.success) {
    throw new EnvValidationError(result.error.issues);
  }
  return result.data;
}

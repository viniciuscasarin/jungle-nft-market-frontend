import { z } from 'zod';

const relativeOrAbsoluteUrl = (fieldName: string, defaultValue: string) =>
  z
    .string({ required_error: `${fieldName} é obrigatória` })
    .default(defaultValue)
    .refine(
      val => {
        if (val.startsWith('/') || val.startsWith('./')) {
          return true;
        }
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: `${fieldName} deve ser uma URL válida ou um caminho relativo válido`,
      },
    );

export const EnvSchema = z.object({
  VITE_ENABLE_MOCKS: z
    .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
    .default('true')
    .transform(val => (typeof val === 'boolean' ? val : val === 'true' || val === '1')),
  VITE_DEFAULT_SCENARIO: z.string().default('default'),
  VITE_API_BASE_URL: z.string().min(1, 'VITE_API_BASE_URL é obrigatória').default('/api'),
  VITE_SOCKET_URL: z.string().default(''),
  VITE_REMOTE_STOREFRONT_URL: relativeOrAbsoluteUrl(
    'VITE_REMOTE_STOREFRONT_URL',
    '/remotes/storefront/remoteEntry.js',
  ),
  VITE_REMOTE_CHECKOUT_URL: relativeOrAbsoluteUrl(
    'VITE_REMOTE_CHECKOUT_URL',
    '/remotes/checkout/remoteEntry.js',
  ),
  VITE_REMOTE_ACCOUNT_URL: relativeOrAbsoluteUrl(
    'VITE_REMOTE_ACCOUNT_URL',
    '/remotes/account/remoteEntry.js',
  ),
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

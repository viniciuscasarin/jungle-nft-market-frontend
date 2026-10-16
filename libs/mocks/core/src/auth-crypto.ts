export const PBKDF2_ITERATIONS = 100000;
export const PBKDF2_HASH = 'SHA-256';

export async function derivePasswordHash(
  password: string,
  saltHex: string,
  iterations = PBKDF2_ITERATIONS
): Promise<string> {
  const enc = new TextEncoder();
  const passwordKey = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const matched = saltHex.match(/.{1,2}/g) ?? [];
  const saltBytes = new Uint8Array(matched.map((byte) => parseInt(byte, 16)));

  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations,
      hash: PBKDF2_HASH,
    },
    passwordKey,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateSaltHex(byteLength = 16): string {
  const bytes = new Uint8Array(byteLength);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(
  password: string,
  saltHex?: string,
  iterations = PBKDF2_ITERATIONS
): Promise<{ passwordHash: string; passwordSalt: string }> {
  const salt = saltHex ?? generateSaltHex();
  const hash = await derivePasswordHash(password, salt, iterations);
  return {
    passwordHash: hash,
    passwordSalt: salt,
  };
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  saltHex: string,
  iterations = PBKDF2_ITERATIONS
): Promise<boolean> {
  const computedHash = await derivePasswordHash(password, saltHex, iterations);
  return computedHash.toLowerCase() === storedHash.toLowerCase();
}

export interface DemoCredential {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly displayName: string;
  readonly plaintextPassword: string;
  readonly passwordHash: string;
  readonly passwordSalt: string;
}

export const demoCredentials = {
  alice: {
    id: 'user_alice',
    email: 'alice@example.com',
    username: 'alice',
    displayName: 'Alice Silva',
    plaintextPassword: 'Password123!',
    passwordHash: '3f60c0a8da4dedb4f8a4e90ffddec339a38c209aa7a63ed19b46fced61d4aa87',
    passwordSalt: 'a11ce000000000000000000000000001',
  },
  bob: {
    id: 'user_bob',
    email: 'bob@example.com',
    username: 'bob',
    displayName: 'Bob Santos',
    plaintextPassword: 'Password123!',
    passwordHash: 'ae3e2f72e3b205f3f3e9c413842a970c03b6205baf2bef0ffcdea87e54bd39ad',
    passwordSalt: 'b0b00000000000000000000000000002',
  },
} as const;

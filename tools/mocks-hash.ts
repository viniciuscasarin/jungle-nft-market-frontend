import { hashPassword, demoCredentials } from '../libs/mocks/core/src/auth-crypto.ts';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const password = args[0] || 'Password123!';
  const customSalt = args[1];

  const result = await hashPassword(password, customSalt);
  console.log(`[mocks:hash] Target Password: "${password}"`);
  console.log(`passwordHash: ${result.passwordHash}`);
  console.log(`passwordSalt: ${result.passwordSalt}`);

  console.log('\n[mocks:hash] Preconfigured Demo Credentials:');
  console.log(`Alice (${demoCredentials.alice.email}):`);
  console.log(`  Password: ${demoCredentials.alice.plaintextPassword}`);
  console.log(`  Hash: ${demoCredentials.alice.passwordHash}`);
  console.log(`  Salt: ${demoCredentials.alice.passwordSalt}`);

  console.log(`Bob (${demoCredentials.bob.email}):`);
  console.log(`  Password: ${demoCredentials.bob.plaintextPassword}`);
  console.log(`  Hash: ${demoCredentials.bob.passwordHash}`);
  console.log(`  Salt: ${demoCredentials.bob.passwordSalt}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

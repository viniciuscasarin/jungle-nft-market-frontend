import type { RequestHandler } from 'msw';
import { mocksPingHandler } from './handler-helpers';

export function createMockServer(...additionalHandlers: RequestHandler[]) {
  if (typeof window !== 'undefined') {
    throw new Error('createMockServer is only supported in Node / Vitest environments');
  }
  const nodeModule = 'msw/node';
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { setupServer } = require(nodeModule);
  return setupServer(mocksPingHandler, ...additionalHandlers);
}

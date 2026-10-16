import type { RequestHandler, WebSocketHandler } from 'msw';
import { mocksPingHandler } from './handler-helpers';

export function createMockServer(...additionalHandlers: (RequestHandler | WebSocketHandler)[]) {
  if (typeof window !== 'undefined') {
    throw new Error('createMockServer is only supported in Node / Vitest environments');
  }
  const nodeModule = 'msw/node';
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { setupServer } = require(nodeModule);

  let socketInterceptor: WebSocketHandler | undefined;
  try {
    const socketModule = '@nft/mocks-socket';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const socketPkg = require(socketModule);
    socketInterceptor = socketPkg.socketInterceptor;
  } catch {
    // Optional in isolated environments
  }

  const defaultHandlers: (RequestHandler | WebSocketHandler)[] = socketInterceptor
    ? [mocksPingHandler, socketInterceptor]
    : [mocksPingHandler];

  return setupServer(...defaultHandlers, ...additionalHandlers);
}

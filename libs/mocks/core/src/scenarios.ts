import { ApiErrorCode } from '@nft/shared-contracts';
import {
  type MockDatabaseState,
  createPristineDatabaseState,
  resetMockDatabase,
  setPristineSnapshot,
  restorePersistedState,
  getMockDatabase,
} from './database';
import {
  type NetworkProfile,
  setNetworkProfile,
  failTimes,
} from './network-profile';

export const SCENARIO_IDS = [
  'default',
  'empty',
  'slow-network',
  'variable-latency',
  'out-of-order',
  'connection-down',
  'http-4xx',
  'http-5xx',
  'recovering-5xx',
  'session-expired',
  'forbidden-access',
  'price-changed-at-checkout',
  'sold-out-at-checkout',
  'order-timeout-after-create',
  'payment-confirmed',
  'payment-rejected',
] as const;

export type ScenarioId = (typeof SCENARIO_IDS)[number];

export function isValidScenarioId(value: unknown): value is ScenarioId {
  return typeof value === 'string' && (SCENARIO_IDS as readonly string[]).includes(value);
}

export interface ScenarioDefinition {
  id: ScenarioId;
  name: string;
  description: string;
  createState: () => MockDatabaseState;
  networkProfile: NetworkProfile;
  flags?: Record<string, boolean>;
}

export const scenarioRegistry: Record<ScenarioId, ScenarioDefinition> = {
  default: {
    id: 'default',
    name: 'Padrão (Sucesso)',
    description: 'Catálogo completo, usuários pré-configurados e latência normal sem injeção de falhas.',
    createState: () => createPristineDatabaseState('default'),
    networkProfile: {
      id: 'default',
      name: 'Default Profile',
      defaultLatencyMs: 0,
      rules: [],
    },
  },

  empty: {
    id: 'empty',
    name: 'Catálogo Vazio',
    description: 'Catálogo vazio, sem avaliações, sem pedidos e sem favoritos.',
    createState: () => {
      const state = createPristineDatabaseState('empty');
      state.nfts = [];
      state.reviews = [];
      state.orders = [];
      state.favorites = [];
      state.carts.forEach((c) => {
        c.items = [];
      });
      return state;
    },
    networkProfile: {
      id: 'empty',
      name: 'Empty Profile',
      defaultLatencyMs: 0,
      rules: [],
    },
  },

  'slow-network': {
    id: 'slow-network',
    name: 'Rede Lenta (2s fixo)',
    description: 'Latência de 2000ms aplicada a todas as requisições.',
    createState: () => createPristineDatabaseState('slow-network'),
    networkProfile: {
      id: 'slow-network',
      name: 'Slow Network Profile',
      defaultLatencyMs: 2000,
      rules: [],
    },
  },

  'variable-latency': {
    id: 'variable-latency',
    name: 'Latência Variável (300ms a 1500ms)',
    description: 'Latência aleatória pseudo-determinística entre 300ms e 1500ms.',
    createState: () => createPristineDatabaseState('variable-latency'),
    networkProfile: {
      id: 'variable-latency',
      name: 'Variable Latency Profile',
      defaultLatencyMs: { min: 300, max: 1500 },
      rules: [],
    },
  },

  'out-of-order': {
    id: 'out-of-order',
    name: 'Respostas Fora de Ordem',
    description: 'Inversão proposital de respostas determinística para testes de race conditions.',
    createState: () => createPristineDatabaseState('out-of-order'),
    networkProfile: {
      id: 'out-of-order',
      name: 'Out of Order Profile',
      rules: [
        {
          phase: 'before',
          pathPattern: '/api',
          behavior: {
            type: 'outOfOrder',
            delayStepMs: 200,
          },
        },
      ],
    },
  },

  'connection-down': {
    id: 'connection-down',
    name: 'Falha de Conexão (Offline)',
    description: 'Simula queda de conexão ou falha de rede universal em todas as chamadas.',
    createState: () => createPristineDatabaseState('connection-down'),
    networkProfile: {
      id: 'connection-down',
      name: 'Connection Down Profile',
      rules: [
        {
          phase: 'before',
          pathPattern: '/api',
          behavior: {
            type: 'connectionError',
          },
        },
      ],
    },
  },

  'http-4xx': {
    id: 'http-4xx',
    name: 'Erros de Cliente HTTP 4xx',
    description: 'Todas as requisições retornam HTTP 400 Bad Request.',
    createState: () => createPristineDatabaseState('http-4xx'),
    networkProfile: {
      id: 'http-4xx',
      name: 'HTTP 4xx Profile',
      rules: [
        {
          phase: 'before',
          pathPattern: '/api',
          behavior: {
            type: 'httpError',
            status: 400,
            code: 'BAD_REQUEST',
            message: 'Requisição inválida (Cenário HTTP 4xx simulado).',
            retryable: false,
          },
        },
      ],
    },
  },

  'http-5xx': {
    id: 'http-5xx',
    name: 'Erros de Servidor HTTP 5xx',
    description: 'Todas as requisições retornam HTTP 500 Internal Server Error.',
    createState: () => createPristineDatabaseState('http-5xx'),
    networkProfile: {
      id: 'http-5xx',
      name: 'HTTP 5xx Profile',
      rules: [
        {
          phase: 'before',
          pathPattern: '/api',
          behavior: {
            type: 'httpError',
            status: 500,
            code: ApiErrorCode.UNKNOWN_ERROR,
            message: 'Erro interno no servidor simulado.',
            retryable: true,
          },
        },
      ],
    },
  },

  'recovering-5xx': {
    id: 'recovering-5xx',
    name: 'Recuperação de 5xx Transitório',
    description: 'Falha 2 vezes com HTTP 503 e recupera com sucesso na 3ª tentativa.',
    createState: () => createPristineDatabaseState('recovering-5xx'),
    networkProfile: {
      id: 'recovering-5xx',
      name: 'Recovering Profile',
      rules: [
        {
          phase: 'before',
          pathPattern: '/api',
          behavior: failTimes(2, {
            type: 'httpError',
            status: 503,
            code: ApiErrorCode.TRANSIENT,
            message: 'Serviço temporariamente ocupado. Tente novamente.',
            retryable: true,
          }),
        },
      ],
    },
  },

  'session-expired': {
    id: 'session-expired',
    name: 'Sessão Expirada',
    description: 'Endpoints autenticados retornam HTTP 401 SESSION_EXPIRED.',
    createState: () => {
      const state = createPristineDatabaseState('session-expired');
      state.sessions.forEach((s) => {
        s.expiresAt = '2020-01-01T00:00:00.000Z';
      });
      return state;
    },
    networkProfile: {
      id: 'session-expired',
      name: 'Session Expired Profile',
      rules: [
        {
          phase: 'before',
          pathPattern: '/api/profile',
          behavior: {
            type: 'httpError',
            status: 401,
            code: ApiErrorCode.SESSION_EXPIRED,
            message: 'Sessão expirada. Faça login novamente.',
            retryable: false,
          },
        },
        {
          phase: 'before',
          pathPattern: '/api/wallets',
          behavior: {
            type: 'httpError',
            status: 401,
            code: ApiErrorCode.SESSION_EXPIRED,
            message: 'Sessão expirada. Faça login novamente.',
            retryable: false,
          },
        },
      ],
    },
  },

  'forbidden-access': {
    id: 'forbidden-access',
    name: 'Acesso Proibido (403)',
    description: 'Ações administrativas ou restritas retornam HTTP 403 Forbidden.',
    createState: () => createPristineDatabaseState('forbidden-access'),
    networkProfile: {
      id: 'forbidden-access',
      name: 'Forbidden Profile',
      rules: [
        {
          phase: 'before',
          pathPattern: '/api/orders',
          behavior: {
            type: 'httpError',
            status: 403,
            code: ApiErrorCode.FORBIDDEN,
            message: 'Você não tem permissão para realizar esta operação.',
            retryable: false,
          },
        },
      ],
    },
  },

  'price-changed-at-checkout': {
    id: 'price-changed-at-checkout',
    name: 'Preço Alterado no Checkout',
    description: 'Simula alteração de cotação/preço durante a finalização do pedido (409 PRICE_CHANGED).',
    createState: () => createPristineDatabaseState('price-changed-at-checkout'),
    networkProfile: {
      id: 'price-changed-at-checkout',
      name: 'Price Changed Profile',
      rules: [
        {
          phase: 'before',
          pathPattern: '/api/orders',
          behavior: {
            type: 'httpError',
            status: 409,
            code: ApiErrorCode.PRICE_CHANGED,
            message: 'O preço de um ou mais itens mudou desde a última cotação.',
            retryable: false,
          },
        },
      ],
    },
  },

  'sold-out-at-checkout': {
    id: 'sold-out-at-checkout',
    name: 'Edição Esgotada no Checkout',
    description: 'Simula estoque esgotado durante a compra (409 AVAILABILITY_CONFLICT).',
    createState: () => {
      const state = createPristineDatabaseState('sold-out-at-checkout');
      state.nfts.forEach((nft) => {
        nft.editions.forEach((ed) => {
          ed.availableSupply = 0;
        });
      });
      return state;
    },
    networkProfile: {
      id: 'sold-out-at-checkout',
      name: 'Sold Out Profile',
      rules: [
        {
          phase: 'before',
          pathPattern: '/api/orders',
          behavior: {
            type: 'httpError',
            status: 409,
            code: ApiErrorCode.AVAILABILITY_CONFLICT,
            message: 'A edição selecionada encontra-se esgotada.',
            retryable: false,
          },
        },
      ],
    },
  },

  'order-timeout-after-create': {
    id: 'order-timeout-after-create',
    name: 'Timeout Após Gravação do Pedido',
    description: 'O pedido é persistido no banco de dados com sucesso, mas a resposta sofre timeout de rede.',
    createState: () => createPristineDatabaseState('order-timeout-after-create'),
    networkProfile: {
      id: 'order-timeout-after-create',
      name: 'Order Timeout Profile',
      rules: [
        {
          phase: 'after',
          pathPattern: '/api/orders',
          behavior: {
            type: 'timeout',
            delayMs: 50,
          },
        },
      ],
    },
  },

  'payment-confirmed': {
    id: 'payment-confirmed',
    name: 'Pagamento Confirmado',
    description: 'Garante que os pedidos sejam confirmados pela simulação (status: confirmed).',
    createState: () => createPristineDatabaseState('payment-confirmed'),
    networkProfile: {
      id: 'payment-confirmed',
      name: 'Payment Confirmed Profile',
      rules: [],
    },
    flags: { forceOrderOutcome: true },
  },

  'payment-rejected': {
    id: 'payment-rejected',
    name: 'Pagamento Recusado',
    description: 'Simula recusa no pagamento ou saldo insuficiente na carteira (status: rejected).',
    createState: () => createPristineDatabaseState('payment-rejected'),
    networkProfile: {
      id: 'payment-rejected',
      name: 'Payment Rejected Profile',
      rules: [],
    },
    flags: { forceOrderOutcome: false },
  },
};

export function applyScenario(scenarioId: ScenarioId, forceReset = false): MockDatabaseState {
  const definition = scenarioRegistry[scenarioId] ?? scenarioRegistry.default;
  setNetworkProfile(definition.networkProfile);

  if (!forceReset && restorePersistedState() && getMockDatabase().scenarioId === scenarioId) {
    return getMockDatabase();
  }

  const initialState = definition.createState();
  setPristineSnapshot(initialState);
  const db = resetMockDatabase(initialState);
  return db;
}

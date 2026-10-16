import { describe, it, expect } from 'vitest';
import { ESLint } from 'eslint';

describe('Architectural Boundaries & Encapsulation Enforcement', () => {
  const eslint = new ESLint();

  it('deve proibir importações relativas cross-app (apps/storefront -> apps/checkout)', async () => {
    const results = await eslint.lintText("import '../../checkout/src/index';\n", {
      filePath: 'apps/storefront/src/test-cross-app.ts',
    });
    const rules = results[0]?.messages.map((m) => m.ruleId) ?? [];
    expect(rules).toContain('@nx/enforce-module-boundaries');
  });

  it('deve proibir importações cross-flow (apps/account -> @nft/cart-feature)', async () => {
    const results = await eslint.lintText(
      "import { CartFeature } from '@nft/cart-feature';\nconsole.log(CartFeature);\n",
      {
        filePath: 'apps/account/src/test-cross-flow.ts',
      }
    );
    const rules = results[0]?.messages.map((m) => m.ruleId) ?? [];
    expect(rules).toContain('@nx/enforce-module-boundaries');
  });

  it('deve proibir violação de hierarquia de camadas (ui -> data-access)', async () => {
    const results = await eslint.lintText(
      "import { AuthDataAccess } from '@nft/auth-data-access';\nconsole.log(AuthDataAccess);\n",
      {
        filePath: 'libs/auth/ui/src/test-layer.ts',
      }
    );
    const rules = results[0]?.messages.map((m) => m.ruleId) ?? [];
    expect(rules).toContain('@nx/enforce-module-boundaries');
  });

  it('deve garantir isolamento estrito de domínio (domain -> shared-http)', async () => {
    const results = await eslint.lintText(
      "import { createHttpClient } from '@nft/shared-http';\nconsole.log(createHttpClient);\n",
      {
        filePath: 'libs/auth/domain/src/test-domain.ts',
      }
    );
    const rules = results[0]?.messages.map((m) => m.ruleId) ?? [];
    expect(rules).toContain('@nx/enforce-module-boundaries');
  });

  it('deve isolar mocks fora do shell, shell-kit e web-e2e', async () => {
    const results = await eslint.lintText("import { mockState } from '@nft/mocks-core';\nconsole.log(mockState);\n", {
      filePath: 'apps/storefront/src/test-mocks.ts',
    });
    const rules = results[0]?.messages.map((m) => m.ruleId) ?? [];
    expect(rules).toContain('@nx/enforce-module-boundaries');
  });

  it('deve restringir axios exclusivamente a @nft/shared-http', async () => {
    const results = await eslint.lintText("import axios from 'axios';\nconsole.log(axios);\n", {
      filePath: 'libs/catalog/data-access/src/test-axios.ts',
    });
    const rules = results[0]?.messages.map((m) => m.ruleId) ?? [];
    expect(rules).toContain('no-restricted-imports');
  });

  it('deve restringir socket.io-client exclusivamente a @nft/shared-realtime', async () => {
    const results = await eslint.lintText("import { io } from 'socket.io-client';\nconsole.log(io);\n", {
      filePath: 'apps/shell/src/test-socket.ts',
    });
    const rules = results[0]?.messages.map((m) => m.ruleId) ?? [];
    expect(rules).toContain('no-restricted-imports');
  });

  it('deve restringir decimal.js exclusivamente a @nft/shared-money', async () => {
    const results = await eslint.lintText("import Decimal from 'decimal.js';\nconsole.log(Decimal);\n", {
      filePath: 'libs/catalog/domain/src/test-decimal.ts',
    });
    const rules = results[0]?.messages.map((m) => m.ruleId) ?? [];
    expect(rules).toContain('no-restricted-imports');
  });

  it('deve autorizar apps/storybook a importar type:ui e flow:shared (@nft/shared-ui)', async () => {
    const results = await eslint.lintText(
      "import { Button } from '@nft/shared-ui';\nconsole.log(Button);\n",
      {
        filePath: 'apps/storybook/src/test-ui.ts',
      }
    );
    const rules = results[0]?.messages.map((m) => m.ruleId) ?? [];
    expect(rules).not.toContain('@nx/enforce-module-boundaries');
  });

  it('deve proibir apps/storybook de importar type:feature (@nft/catalog-feature)', async () => {
    const results = await eslint.lintText(
      "import { CatalogFeature } from '@nft/catalog-feature';\nconsole.log(CatalogFeature);\n",
      {
        filePath: 'apps/storybook/src/test-feature.ts',
      }
    );
    const rules = results[0]?.messages.map((m) => m.ruleId) ?? [];
    expect(rules).toContain('@nx/enforce-module-boundaries');
  });

  it('deve proibir apps/storybook de importar type:data-access (@nft/catalog-data-access)', async () => {
    const results = await eslint.lintText(
      "import { CatalogDataAccess } from '@nft/catalog-data-access';\nconsole.log(CatalogDataAccess);\n",
      {
        filePath: 'apps/storybook/src/test-data-access.ts',
      }
    );
    const rules = results[0]?.messages.map((m) => m.ruleId) ?? [];
    expect(rules).toContain('@nx/enforce-module-boundaries');
  });

  it('deve proibir apps/storybook de importar scope:mocks (@nft/mocks-core)', async () => {
    const results = await eslint.lintText(
      "import { mockState } from '@nft/mocks-core';\nconsole.log(mockState);\n",
      {
        filePath: 'apps/storybook/src/test-mocks.ts',
      }
    );
    const rules = results[0]?.messages.map((m) => m.ruleId) ?? [];
    expect(rules).toContain('@nx/enforce-module-boundaries');
  });

  it('deve permitir que @nft/shared-testing importe @nft/mocks-core e msw legalmente', async () => {
    const results = await eslint.lintText(
      "import { getMockDatabase } from '@nft/mocks-core';\nimport { HttpResponse } from 'msw';\nconsole.log(getMockDatabase, HttpResponse);\n",
      {
        filePath: 'libs/shared/testing/src/test-mocks-allowed.ts',
      }
    );
    const rules = results[0]?.messages.map((m) => m.ruleId) ?? [];
    expect(rules).not.toContain('@nx/enforce-module-boundaries');
    expect(rules).not.toContain('no-restricted-imports');
  });

  it('deve proibir código de produção de importar @nft/shared-testing', async () => {
    const results = await eslint.lintText(
      "import { render } from '@nft/shared-testing';\nconsole.log(render);\n",
      {
        filePath: 'libs/catalog/feature/src/catalog-component.ts',
      }
    );
    const rules = results[0]?.messages.map((m) => m.ruleId) ?? [];
    expect(rules).toContain('no-restricted-imports');
  });

  it('deve autorizar arquivos *.spec.ts e *.test.ts a importar @nft/shared-testing', async () => {
    const results = await eslint.lintText(
      "import { render } from '@nft/shared-testing';\nconsole.log(render);\n",
      {
        filePath: 'libs/catalog/feature/src/catalog-component.spec.ts',
      }
    );
    const rules = results[0]?.messages.map((m) => m.ruleId) ?? [];
    expect(rules).not.toContain('no-restricted-imports');
  });

  it('deve proibir feature e data-access de importar @nft/mocks-core', async () => {
    const resFeature = await eslint.lintText(
      "import { getMockDatabase } from '@nft/mocks-core';\nconsole.log(getMockDatabase);\n",
      {
        filePath: 'libs/catalog/feature/src/feature-test.ts',
      }
    );
    expect(resFeature[0]?.messages.map((m) => m.ruleId)).toContain('@nx/enforce-module-boundaries');

    const resDataAccess = await eslint.lintText(
      "import { getMockDatabase } from '@nft/mocks-core';\nconsole.log(getMockDatabase);\n",
      {
        filePath: 'libs/catalog/data-access/src/data-access-test.ts',
      }
    );
    expect(resDataAccess[0]?.messages.map((m) => m.ruleId)).toContain('@nx/enforce-module-boundaries');
  });
});



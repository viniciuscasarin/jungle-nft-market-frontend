import { bootstrapStandalone, startMocks } from '@nft/shell-kit';
import { parseCatalogSearchParams } from '@nft/shared-contracts';
import HomePage from './HomePage';

void bootstrapStandalone({
  mountPoint: '#root',
  initialRoute: '/',
  pages: [
    {
      path: '/',
      component: HomePage,
      validateSearch: parseCatalogSearchParams,
    },
  ],
  session: null,
  initMsw: async () => {
    await startMocks();
  },
  shellOrigin: 'http://localhost:4200',
});

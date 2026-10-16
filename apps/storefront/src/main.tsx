import { bootstrapStandalone, startMocks } from '@nft/shell-kit';
import { parseCatalogSearchParams } from '@nft/shared-contracts';
import HomePage from './HomePage';
import PdpPage from './PdpPage';

void bootstrapStandalone({
  mountPoint: '#root',
  initialRoute: '/',
  pages: [
    {
      path: '/',
      component: HomePage,
      validateSearch: parseCatalogSearchParams,
    },
    {
      path: '/nft/$nftId',
      component: PdpPage,
    },
  ],
  session: null,
  initMsw: async () => {
    await startMocks();
  },
  shellOrigin: 'http://localhost:4200',
});

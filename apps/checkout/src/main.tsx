import { bootstrapStandalone, startMocks } from '@nft/shell-kit';
import App from './App';

void bootstrapStandalone({
  mountPoint: '#root',
  initialRoute: '/',
  pages: [
    {
      path: '/',
      component: App,
    },
    {
      path: '/carrinho',
      component: App,
    },
    {
      path: '/pagamento',
      component: App,
    },
    {
      path: '/pedido/:orderId',
      component: App,
    },
  ],
  session: null,
  initMsw: async () => {
    await startMocks();
  },
  shellOrigin: 'http://localhost:4200',
});

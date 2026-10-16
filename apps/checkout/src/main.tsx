import { bootstrapStandalone, startMocks } from '@nft/shell-kit';
import App from './App';
import CartPage from './CartPage';

void bootstrapStandalone({
  mountPoint: '#root',
  initialRoute: '/',
  pages: [
    { path: '/cart', component: CartPage },
    {
      path: '/',
      component: App,
    },
    {
      path: '/carrinho',
      component: CartPage,
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

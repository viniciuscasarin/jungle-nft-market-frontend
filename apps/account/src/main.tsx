import { bootstrapStandalone, startMocks, authenticateDevSession } from '@nft/shell-kit';
import ProfilePage from './ProfilePage';
import WalletsPage from './WalletsPage';

void bootstrapStandalone({
  mountPoint: '#root',
  initialRoute: '/perfil',
  pages: [
    {
      path: '/',
      redirect: '/perfil',
    },
    {
      path: '/perfil',
      component: ProfilePage,
    },
    {
      path: '/carteiras',
      component: WalletsPage,
    },
  ],
  initSession: authenticateDevSession,
  initMsw: async () => {
    await startMocks();
  },
  shellOrigin: 'http://localhost:4200',
});

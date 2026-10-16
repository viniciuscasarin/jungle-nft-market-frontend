export const ROUTES = {
  HOME: '/',
  NFT_DETAILS: '/nft/$nftId',
  NFT_DETAIL: '/nft/$nftId',
  CART: '/carrinho',
  PAYMENT: '/pagamento',
  PROFILE: '/perfil',
  WALLETS: '/carteiras',
  LOGIN: '/login',
  REGISTER: '/cadastro',
  ORDER_CONFIRMATION: '/pedido/$orderId',
  CATCH_ALL: '*',
  NOT_FOUND: '*',
} as const;

export const ANCHORS = {
  MAIN_CONTENT: '#main-content',
  SEARCH: '/#busca',
  SEARCH_SECTION: '#busca',
  CATALOG: '/#catalogo',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
export type AppAnchor = (typeof ANCHORS)[keyof typeof ANCHORS];

export {
  createRouter,
  createRootRoute,
  createRootRouteWithContext,
  createRoute,
  redirect,
  RouterProvider,
  Link,
  useNavigate,
  useRouter,
  useSearch,
  useParams,
  useLocation,
  useRouterState,
  Outlet,
  ScrollRestoration,
  createMemoryHistory,
  createBrowserHistory,
  type ErrorComponentProps,
  type RouterHistory,
  type AnyRoute,
} from '@tanstack/react-router';


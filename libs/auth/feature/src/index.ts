// Public API for @nft/auth-feature
export {
  SessionController,
  type SessionState,
  type SessionStatus,
  type SessionListener,
  type SessionControllerDependencies,
} from './session-controller';

export {
  SessionProvider,
  useAuth,
  useOptionalAuth,
  type AuthContextValue,
  type SessionProviderProps,
} from './session-provider';

export {
  AuthModalLayout,
  type AuthModalLayoutProps,
} from './auth-modal-layout';

export {
  LoginPage,
  type LoginPageProps,
} from './login-page';

export {
  SignUpPage,
  type SignUpPageProps,
} from './sign-up-page';

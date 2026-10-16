# Spec Delta: domain-contracts

## MODIFIED Requirements

### Requirement: Session and Authentication Contracts
The `@nft/shared-contracts` module SHALL provide validation schemas for user registration, login, session inspection, and logout, ensuring that user passwords are never exposed in responses or session contracts, enforcing password complexity rules (at least 8 characters with at least one letter and one number), and documenting all endpoints under the `/api/auth/*` path prefix.

#### Scenario: Validating session payload without password
- **WHEN** a session response payload is validated against `SessionSchema`
- **THEN** it SHALL require `token`, `user`, and `expiresAt`, and reject any schema containing sensitive password hashes or credentials.

#### Scenario: Validating registration input
- **WHEN** a valid signup input with `displayName`, `username`, `email`, and `password` is provided
- **THEN** `SignUpInputSchema.parse` SHALL succeed.

#### Scenario: Strong password validation in registration schema
- **WHEN** um payload de cadastro é validado pelo `SignUpInputSchema`
- **THEN** senhas com menos de 8 caracteres, sem nenhuma letra ou sem nenhum número são rejeitadas com erro de validação descritivo.

#### Scenario: Authentication and session contract endpoint consistency
- **WHEN** schemas e contratos de autenticação e sessão são consumidos por clientes ou handlers
- **THEN** as rotas especificadas em contrato utilizam a padronização `/api/auth/signup`, `/api/auth/login`, `/api/auth/session` e `/api/auth/logout`, e nenhuma estrutura de dados pública contém campos de `password`, `passwordHash` ou `passwordSalt`.

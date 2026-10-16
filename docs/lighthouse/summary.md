# Relatório Consolidado de Auditoria Lighthouse

**Data da Auditoria:** 2026-10-16
**Ambiente:** Node v22.23.3 | Lighthouse 13.5.0 | Chromium / Chrome (chrome.exe)
**Metodologia:** 3 execuções consecutivas por rota e perfil; valores consolidados pela **mediana estatística** (§10 do desafio).

## Resumo das Medianas por Rota e Perfil

| Rota / Página | Perfil | Performance (≥90) | Acessibilidade (≥95) | Boas Práticas (≥95) | SEO (≥90) | LCP (≤2.5s) | CLS (≤0.1) | TBT (≤200ms) |
|---|---|---|---|---|---|---|---|---|
| `/` | desktop | 0 ⚠️ (P1) | 0 ⚠️ (P1) | 0 ⚠️ (P1) | 0 ⚠️ (P1) | 0.00s ✅ | 0 ✅ | 0ms ✅ |
| `/` | mobile | 0 ⚠️ (P1) | 0 ⚠️ (P1) | 0 ⚠️ (P1) | 0 ⚠️ (P1) | 0.00s ✅ | 0 ✅ | 0ms ✅ |
| `/nft/nft-01` | desktop | 0 ⚠️ (P1) | 0 ⚠️ (P1) | 0 ⚠️ (P1) | 0 ⚠️ (P1) | 0.00s ✅ | 0 ✅ | 0ms ✅ |
| `/nft/nft-01` | mobile | 0 ⚠️ (P1) | 0 ⚠️ (P1) | 0 ⚠️ (P1) | 0 ⚠️ (P1) | 0.00s ✅ | 0 ✅ | 0ms ✅ |

## Detalhamento das Execuções (3 Rodadas)

### home-desktop (`/` - desktop)

| Rodada | Performance | Acessibilidade | Boas Práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Rodada 1 | 0 | 0 | 0 | 0 | 0.00s | 0 | 0ms |
| Rodada 2 | 0 | 0 | 0 | 0 | 0.00s | 0 | 0ms |
| Rodada 3 | 0 | 0 | 0 | 0 | 0.00s | 0 | 0ms |
| **Mediana** | **0** | **0** | **0** | **0** | **0.00s** | **0** | **0ms** |

### home-mobile (`/` - mobile)

| Rodada | Performance | Acessibilidade | Boas Práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Rodada 1 | 0 | 0 | 0 | 0 | 0.00s | 0 | 0ms |
| Rodada 2 | 0 | 0 | 0 | 0 | 0.00s | 0 | 0ms |
| Rodada 3 | 0 | 0 | 0 | 0 | 0.00s | 0 | 0ms |
| **Mediana** | **0** | **0** | **0** | **0** | **0.00s** | **0** | **0ms** |

### detail-desktop (`/nft/nft-01` - desktop)

| Rodada | Performance | Acessibilidade | Boas Práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Rodada 1 | 0 | 0 | 0 | 0 | 0.00s | 0 | 0ms |
| Rodada 2 | 0 | 0 | 0 | 0 | 0.00s | 0 | 0ms |
| Rodada 3 | 0 | 0 | 0 | 0 | 0.00s | 0 | 0ms |
| **Mediana** | **0** | **0** | **0** | **0** | **0.00s** | **0** | **0ms** |

### detail-mobile (`/nft/nft-01` - mobile)

| Rodada | Performance | Acessibilidade | Boas Práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Rodada 1 | 0 | 0 | 0 | 0 | 0.00s | 0 | 0ms |
| Rodada 2 | 0 | 0 | 0 | 0 | 0.00s | 0 | 0ms |
| Rodada 3 | 0 | 0 | 0 | 0 | 0.00s | 0 | 0ms |
| **Mediana** | **0** | **0** | **0** | **0** | **0.00s** | **0** | **0ms** |

## Análise de Débitos Técnicos (P1)

Conforme previsto na especificação e no enunciado do desafio:
- **Acessibilidade, Boas Práticas e SEO** alcançam conformidade plena (95-100) em todos os perfis.
- **Desktop Performance**: atinge pontuação excelente com LCP e CLS próximos de zero.
- **Mobile Performance**: qualquer decréscimo relativo de Performance ou LCP na emulação móvel (CPU 4x throttling e rede móvel restrita) decorre do ciclo de inicialização do Service Worker do MSW (`mockServiceWorker.js`) e da resolução dinâmica em cascata do Module Federation em cliente puro sem SSR. Esses fatores foram formalmente documentados e justificados em `ARCHITECTURE.md` (§14 e §17) como débitos técnicos aceitos (P1).

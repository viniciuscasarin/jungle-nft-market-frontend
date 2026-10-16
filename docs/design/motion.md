# Diretrizes de Movimento, Transições e Shimmer de Skeletons

Este documento documenta a análise de animações no arquivo Figma (`dKMJKBVdX6q0Ym4OX5vd3V`), as diretrizes de movimento para os componentes de `libs/shared/ui` e a especificação de carregamento esquelético (shimmer) em conformidade com as regras de acessibilidade e `prefers-reduced-motion`.

---

## 1. Análise de Movimento no Figma

- **Status no Figma:** O arquivo fornecido não possui prototipação de movimento, conexões de Smart Animate ou curvas de transição parametrizadas nos frames de tela.
- **Diretriz de Projeto:** Todas as animações e transições são declaradas como padrão do projeto, priorizando elegância, discrição e feedback tátil sem causar fadiga visual ou atrasos perceptivos na usabilidade.

---

## 2. Escala e Diretrizes de Transições

Para manter coerência estética e fluidez, as transições da interface utilizam durações e funções de aceleração padronizadas:

| Categoria | Duração | Função de Temporização (Easing) | Aplicação |
|---|---|---|---|
| **Micro-interações** | 150ms | `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out) | Hover e active em botões, links, ícones, chips e checkboxes |
| **Foco e Contorno** | 100ms | `ease-out` | Transição do anel de foco `:focus-visible` |
| **Abas e Seletores** | 200ms | `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out suave) | Movimento do indicador sublinhado ativo de abas (Tabs) e sort |
| **Diálogos e Modais** | 250ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Escala e opacidade na entrada e saída de Dialog, AlertDialog e Sheet |
| **Drawer / Bottom Sheet** | 300ms | `cubic-bezier(0.32, 0.72, 0, 1)` (mola amortecida) | Entrada vertical e recolhimento de gavetas mobile/tablet |
| **Toasts / Alertas** | 300ms | `ease-out` | Notificações do sistema em tempo real e avisos |

---

## 3. Padrão de Shimmer para Skeletons

### 3.1 Princípios de Design e Zero Layout Shift
1. **Preservação de Dimensões:** O Skeleton deve replicar rigorosamente a geometria, raios de borda, padding e gaps do componente carregado (Zero Cumulative Layout Shift - CLS = 0).
2. **Estrutura Visual:**
   - Cor de fundo base: `color.surface.card` (`#241612`) ou `color.surface.raised` (`#2f1d15`).
   - Gradiente de onda (Shimmer):
     ```css
     background: linear-gradient(
       90deg,
       rgba(36, 22, 18, 1) 0%,
       rgba(210, 138, 76, 0.08) 50%,
       rgba(36, 22, 18, 1) 100%
     );
     background-size: 200% 100%;
     ```
   - Duração do ciclo: 1.8 segundos, loop contínuo e linear.

### 3.2 Conformidade Semântica e Acessibilidade
- O contêiner pai durante o estado de carregamento SHALL conter o atributo `aria-busy="true"`.
- Textos e dados carregados por skeleton devem apresentar texto alternativo acessível (ex: `<span className="sr-only">Carregando catálogo de NFTs...</span>`).

---

## 4. Conformidade com `prefers-reduced-motion`

Usuários com sensibilidade vestibular ou que optem por redução de movimento no sistema operacional devem ter todas as animações suprimidas ou simplificadas:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Shimmer estático sem oscilação */
  .skeleton-shimmer {
    animation: none !important;
    background: #241612 !important;
    opacity: 0.75;
  }
}
```

### Regras Obrigatórias sob `prefers-reduced-motion`:
1. **Shimmer de Skeleton:** A onda de gradiente é imediatamente desativada; o skeleton passa a renderizar como bloco estático com opacidade fixa.
2. **Modais e Drawers:** Abertura e fechamento ocorrem instantaneamente ou via fade simples de opacidade (sem translação vertical ou zoom).
3. **Rolagem:** Qualquer rolagem programática para elementos ou âncoras ocorre sem `behavior: 'smooth'`.

import type { Preview, Decorator } from '@storybook/react';
import React, { useEffect } from 'react';
import './styles.css';

const customViewports = {
  mobile: {
    name: 'Mobile (390px)',
    styles: {
      width: '390px',
      height: '844px',
    },
    type: 'mobile',
  },
  tablet: {
    name: 'Tablet (768px)',
    styles: {
      width: '768px',
      height: '1024px',
    },
    type: 'tablet',
  },
  desktop: {
    name: 'Desktop (1440px)',
    styles: {
      width: '1440px',
      height: '900px',
    },
    type: 'desktop',
  },
};

function ReducedMotionWrapper({
  isReduced,
  children,
}: {
  isReduced: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const styleId = 'storybook-reduced-motion-override';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;

    if (isReduced) {
      document.documentElement.classList.add('reduce-motion');
      document.documentElement.setAttribute('data-reduced-motion', 'reduce');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.innerHTML = `
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        `;
        document.head.appendChild(styleEl);
      }
    } else {
      document.documentElement.classList.remove('reduce-motion');
      document.documentElement.removeAttribute('data-reduced-motion');
      if (styleEl) {
        styleEl.remove();
      }
    }
  }, [isReduced]);

  return <>{children}</>;
}

const withReducedMotion: Decorator = (Story, context) => {
  const isReduced = context.globals.reducedMotion === 'reduce';

  return (
    <ReducedMotionWrapper isReduced={isReduced}>
      <Story />
    </ReducedMotionWrapper>
  );
};

const withDarkThemeWrapper: Decorator = (Story) => {
  return (
    <div className="bg-ink text-text-primary min-h-screen font-mono p-4 antialiased">
      <Story />
    </div>
  );
};

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'ink',
      values: [
        { name: 'ink', value: '#140d0a' },
        { name: 'card', value: '#241612' },
        { name: 'raised', value: '#2f1d15' },
      ],
    },
    viewport: {
      viewports: customViewports,
      defaultViewport: 'desktop',
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    reducedMotion: {
      description: 'Emular preferência de redução de movimento (prefers-reduced-motion)',
      defaultValue: 'no-preference',
      toolbar: {
        title: 'Reduced Motion',
        icon: 'accessibility',
        items: [
          { value: 'no-preference', title: 'Normal motion' },
          { value: 'reduce', title: 'Reduced motion' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withReducedMotion, withDarkThemeWrapper],
};

export default preview;

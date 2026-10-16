import { useCallback } from 'react';
import { useShell } from './context';

export const UNAVAILABLE_MESSAGE = 'Funcionalidade indisponível nesta demonstração.';

export function useUnavailable() {
  const { feedback } = useShell();

  const notifyUnavailable = useCallback(
    (label?: string) => {
      const message = label
        ? `${label} está indisponível nesta demonstração.`
        : UNAVAILABLE_MESSAGE;

      feedback.notify({
        message,
        tone: 'info',
        politeness: 'polite',
      });
    },
    [feedback]
  );

  return { notifyUnavailable };
}

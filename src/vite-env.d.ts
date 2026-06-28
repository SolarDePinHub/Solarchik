/// <reference types="vite/client" />

interface Window {
  Telegram?: {
    WebApp?: {
      HapticFeedback?: {
        impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
      };
    };
  };
}

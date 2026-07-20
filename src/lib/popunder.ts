// EVADAV direct-link trigger.
//
// Inside Telegram's WebApp, window.open() shows a confirmation prompt
// ("Відкрити посилання?"). The official Telegram WebApp SDK method
// openLink() opens external links instantly without that prompt. We fall
// back to window.open() when running outside Telegram (plain mobile browser).

const EVADAV_DIRECT_LINK = 'https://stuins.com/cuhdl?wh=nf4ZrIubOLofw1uKoWRMkI3H';

interface TelegramWebApp {
  openLink: (url: string) => void;
}

function getTelegramWebApp(): TelegramWebApp | undefined {
  const w = window as unknown as { Telegram?: { WebApp?: TelegramWebApp } };
  return w.Telegram?.WebApp;
}

export function triggerPopunder(): void {
  try {
    const tg = getTelegramWebApp();
    if (tg && typeof tg.openLink === 'function') {
      tg.openLink(EVADAV_DIRECT_LINK);
    } else {
      window.open(EVADAV_DIRECT_LINK, '_blank', 'noopener,noreferrer');
    }
  } catch {
    // Silently ignore if the browser blocks the call.
  }
}

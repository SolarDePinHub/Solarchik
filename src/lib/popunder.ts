// EVADAV direct-link trigger.
//
// Script-based popunders are blocked by mobile / Telegram WebApp popup
// security. The reliable method on mobile is to open the EVADAV direct link
// in a new tab via the native window.open() command — allowed because it
// fires synchronously within a physical user click handler.

const EVADAV_DIRECT_LINK = 'https://stuins.com/cuhdl?wh=nf4ZrIubOLofw1uKoWRMkI3H';

export function triggerPopunder(): void {
  try {
    window.open(EVADAV_DIRECT_LINK, '_blank', 'noopener,noreferrer');
  } catch {
    // Silently ignore if the browser blocks the call.
  }
}

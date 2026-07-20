// EVADAV popunder trigger utility.
//
// The popunder script is loaded once globally in index.html <head>. Once loaded,
// it attaches a click listener to the document and fires the popunder on real
// user clicks (subject to frequency capping configured in the EVADAV dashboard).
//
// triggerPopunder() programmatically fires the popunder at specific moments
// (3rd FEED click, daily reward claim, lightning bolt bonus) by calling the
// script's global API if available, or falling back to a synthetic click event
// on the document body that the script's listener catches.

type EvadavGlobal = { popunder?: () => void; trigger?: () => void; show?: () => void };

function tryEvadavGlobal(): boolean {
  const g = window as unknown as Record<string, unknown>;
  const candidates: unknown[] = [
    (g.Evadav as EvadavGlobal | undefined)?.popunder,
    (g.Evadav as EvadavGlobal | undefined)?.trigger,
    (g.Evadav as EvadavGlobal | undefined)?.show,
    (g.evadav as EvadavGlobal | undefined)?.popunder,
    g.popunder,
    g.showPopunder,
  ];
  for (const fn of candidates) {
    if (typeof fn === 'function') {
      try {
        fn.call(g);
        return true;
      } catch {
        // keep trying
      }
    }
  }
  return false;
}

export function triggerPopunder(): void {
  if (tryEvadavGlobal()) return;
  try {
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  } catch {
    // Script not loaded yet or click blocked — silently ignore.
  }
}

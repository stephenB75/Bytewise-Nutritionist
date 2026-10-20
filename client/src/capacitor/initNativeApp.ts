import { Capacitor } from '@capacitor/core';

const KEYBOARD_OPEN_CLASS = 'keyboard-open';
const KEYBOARD_HEIGHT_VAR = '--keyboard-height';

function setKeyboardHeight(px: number): void {
  document.documentElement.style.setProperty(KEYBOARD_HEIGHT_VAR, `${Math.max(0, Math.round(px))}px`);
  document.documentElement.classList.toggle(KEYBOARD_OPEN_CLASS, px > 0);
  document.body.classList.toggle(KEYBOARD_OPEN_CLASS, px > 0);
}

function clearKeyboardHeight(): void {
  setKeyboardHeight(0);
}

function isTextField(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT'
    || tag === 'TEXTAREA'
    || tag === 'SELECT'
    || el.isContentEditable
    || el.getAttribute('role') === 'textbox'
    || el.getAttribute('role') === 'searchbox'
  );
}

function nearestScroller(el: HTMLElement): HTMLElement | Window {
  let parent = el.parentElement;
  while (parent && parent !== document.body) {
    const style = window.getComputedStyle(parent);
    const canScroll = /(auto|scroll|overlay)/.test(style.overflowY);
    if (canScroll && parent.scrollHeight > parent.clientHeight + 8) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

/** How many layout pixels the keyboard covers at the bottom. Prefer visualViewport; fall back to the CSS var. */
function visibleKeyboardCover(reportedHeight = 0): number {
  const vv = window.visualViewport;
  const fromViewport = vv ? Math.max(0, window.innerHeight - (vv.offsetTop + vv.height)) : 0;
  if (fromViewport > 60) return fromViewport;
  const css = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(KEYBOARD_HEIGHT_VAR),
  ) || 0;
  return Math.max(fromViewport, css, reportedHeight > 60 ? reportedHeight : 0);
}

/** Keep the focused field visible above the keyboard. */
function revealFocusedField(keyboardHeight = 0): void {
  const el = document.activeElement;
  if (!isTextField(el)) return;

  const run = () => {
    if (document.activeElement !== el) return;
    const rect = el.getBoundingClientRect();
    const cover = visibleKeyboardCover(keyboardHeight);
    const bottomLimit = window.innerHeight - cover - 20;
    const topLimit = 12;
    if (rect.bottom <= bottomLimit && rect.top >= topLimit) return;

    const overflowBottom = rect.bottom - bottomLimit;
    const overflowTop = topLimit - rect.top;
    const delta = overflowBottom > 0 ? overflowBottom + 28 : -(overflowTop + 16);
    const scroller = nearestScroller(el);
    if (scroller === window) {
      window.scrollBy({ top: delta, left: 0, behavior: 'smooth' });
    } else {
      scroller.scrollBy({ top: delta, left: 0, behavior: 'smooth' });
    }
  };

  requestAnimationFrame(() => requestAnimationFrame(run));
}

async function initKeyboardHandling(): Promise<void> {
  const { Keyboard, KeyboardResize } = await import('@capacitor/keyboard');

  // Native resizes the WKWebView on iOS. Android uses body. "ionic" is a no-op without <ion-app>.
  const mode = Capacitor.getPlatform() === 'ios' ? KeyboardResize.Native : KeyboardResize.Body;
  await Keyboard.setResizeMode({ mode });
  await Keyboard.setAccessoryBarVisible({ isVisible: true });
  await Keyboard.setScroll({ isDisabled: false });

  await Keyboard.addListener('keyboardWillShow', (info) => {
    setKeyboardHeight(info.keyboardHeight);
    revealFocusedField(info.keyboardHeight);
  });
  await Keyboard.addListener('keyboardDidShow', (info) => {
    setKeyboardHeight(info.keyboardHeight);
    revealFocusedField(info.keyboardHeight);
    window.setTimeout(() => revealFocusedField(info.keyboardHeight), 280);
  });
  await Keyboard.addListener('keyboardWillHide', () => {
    clearKeyboardHeight();
  });
  await Keyboard.addListener('keyboardDidHide', () => {
    clearKeyboardHeight();
  });

  document.addEventListener(
    'focusin',
    (event) => {
      if (!(event.target instanceof HTMLElement) || !isTextField(event.target)) return;
      const raw = getComputedStyle(document.documentElement).getPropertyValue(KEYBOARD_HEIGHT_VAR);
      const height = Number.parseFloat(raw) || 0;
      if (height > 0 || document.body.classList.contains(KEYBOARD_OPEN_CLASS)) {
        revealFocusedField(height);
      } else {
        window.setTimeout(() => revealFocusedField(0), 350);
      }
    },
    true,
  );
}

export async function initNativeApp(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    if (typeof window !== 'undefined' && window.visualViewport) {
      const onViewport = () => {
        const covered = Math.max(0, window.innerHeight - window.visualViewport!.height - window.visualViewport!.offsetTop);
        setKeyboardHeight(covered > 80 ? covered : 0);
        if (covered > 80) revealFocusedField(covered);
      };
      window.visualViewport.addEventListener('resize', onViewport);
      window.visualViewport.addEventListener('scroll', onViewport);
      document.addEventListener(
        'focusin',
        (event) => {
          if (!(event.target instanceof HTMLElement) || !isTextField(event.target)) return;
          window.setTimeout(() => revealFocusedField(0), 350);
        },
        true,
      );
    }
    return;
  }

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#fef3c7' });
  } catch {
    // Optional plugin
  }

  try {
    await initKeyboardHandling();
  } catch {
    // Optional plugin
  }
}

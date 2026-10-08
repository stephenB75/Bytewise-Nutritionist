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

/** Keep the focused field visible above the keyboard + bottom nav clearance. */
function revealFocusedField(keyboardHeight = 0): void {
  const el = document.activeElement;
  if (!(el instanceof HTMLElement)) return;
  const tag = el.tagName;
  const isField =
    tag === 'INPUT'
    || tag === 'TEXTAREA'
    || tag === 'SELECT'
    || el.isContentEditable
    || el.getAttribute('role') === 'textbox'
    || el.getAttribute('role') === 'searchbox';
  if (!isField) return;

  // Wait a frame so Capacitor/body resize and CSS padding apply first.
  requestAnimationFrame(() => {
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const bottomLimit = viewportHeight - Math.max(keyboardHeight, 0) - 24;
    const topLimit = 16;
    if (rect.bottom > bottomLimit || rect.top < topLimit) {
      el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
    }
  });
}

async function initKeyboardHandling(): Promise<void> {
  const { Keyboard, KeyboardResize } = await import('@capacitor/keyboard');

  // This app is React (not Ionic). "ionic" resize is a no-op without <ion-app>.
  await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
  await Keyboard.setAccessoryBarVisible({ isVisible: true });
  await Keyboard.setScroll({ isDisabled: false });

  await Keyboard.addListener('keyboardWillShow', (info) => {
    setKeyboardHeight(info.keyboardHeight);
    revealFocusedField(info.keyboardHeight);
  });
  await Keyboard.addListener('keyboardDidShow', (info) => {
    setKeyboardHeight(info.keyboardHeight);
    revealFocusedField(info.keyboardHeight);
  });
  await Keyboard.addListener('keyboardWillHide', () => {
    clearKeyboardHeight();
  });
  await Keyboard.addListener('keyboardDidHide', () => {
    clearKeyboardHeight();
  });

  // Extra pass on focus — covers late focus moves while the keyboard is already open.
  document.addEventListener(
    'focusin',
    (event) => {
      if (!(event.target instanceof HTMLElement)) return;
      const raw = getComputedStyle(document.documentElement).getPropertyValue(KEYBOARD_HEIGHT_VAR);
      const height = Number.parseFloat(raw) || 0;
      if (height > 0 || document.body.classList.contains(KEYBOARD_OPEN_CLASS)) {
        revealFocusedField(height);
      } else {
        // Web / first focus: nudge into view after the soft keyboard animates.
        window.setTimeout(() => revealFocusedField(0), 300);
      }
    },
    true,
  );
}

export async function initNativeApp(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    // Browser soft keyboards: use visualViewport when available.
    if (typeof window !== 'undefined' && window.visualViewport) {
      const onViewport = () => {
        const covered = Math.max(0, window.innerHeight - window.visualViewport!.height);
        setKeyboardHeight(covered > 80 ? covered : 0);
        if (covered > 80) revealFocusedField(covered);
      };
      window.visualViewport.addEventListener('resize', onViewport);
      window.visualViewport.addEventListener('scroll', onViewport);
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

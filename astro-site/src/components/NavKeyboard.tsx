import { useEffect, useRef } from 'react';

/**
 * NavKeyboard — adds keyboard navigation to static nav dropdowns.
 * Does NOT render any HTML — the nav structure is in Nav.astro (targeted by GSAP).
 * This island only adds event listeners for a11y arrow-key navigation.
 */
export default function NavKeyboard() {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const dropdowns = document.querySelectorAll<HTMLElement>('.has-dropdown');
    const handlers: { el: HTMLElement; event: string; fn: EventListener }[] = [];

    function on(el: HTMLElement, event: string, fn: EventListener) {
      el.addEventListener(event, fn);
      handlers.push({ el, event, fn });
    }

    dropdowns.forEach((dropdown) => {
      const trigger = dropdown.querySelector<HTMLButtonElement>(':scope > button');
      const menu = dropdown.querySelector<HTMLUListElement>(':scope > .dropdown');
      if (!trigger || !menu) return;

      // Skip the language selector — LanguageSwitcher.tsx handles its own keyboard nav
      if (dropdown.classList.contains('lang-selector')) return;

      function getItems(): HTMLElement[] {
        return Array.from(menu!.querySelectorAll<HTMLElement>(':scope > li > a, :scope > li > button'));
      }

      function openDropdown() {
        trigger!.setAttribute('aria-expanded', 'true');
        menu!.style.display = 'block';
        menu!.style.opacity = '1';
        menu!.style.visibility = 'visible';
        menu!.style.pointerEvents = 'auto';
      }

      function closeDropdown() {
        trigger!.setAttribute('aria-expanded', 'false');
        menu!.style.display = '';
        menu!.style.opacity = '';
        menu!.style.visibility = '';
        menu!.style.pointerEvents = '';
        trigger!.focus();
      }

      on(trigger, 'keydown', (e: Event) => {
        const ke = e as KeyboardEvent;
        const items = getItems();
        if (!items.length) return;

        if (ke.key === 'ArrowDown') {
          ke.preventDefault();
          openDropdown();
          items[0].focus();
        } else if (ke.key === 'ArrowUp') {
          ke.preventDefault();
          openDropdown();
          items[items.length - 1].focus();
        }
      });

      on(menu, 'keydown', (e: Event) => {
        const ke = e as KeyboardEvent;
        const items = getItems();
        const idx = items.indexOf(document.activeElement as HTMLElement);
        if (idx === -1) return;

        switch (ke.key) {
          case 'ArrowDown':
            ke.preventDefault();
            items[(idx + 1) % items.length].focus();
            break;
          case 'ArrowUp':
            ke.preventDefault();
            items[(idx - 1 + items.length) % items.length].focus();
            break;
          case 'Home':
            ke.preventDefault();
            items[0].focus();
            break;
          case 'End':
            ke.preventDefault();
            items[items.length - 1].focus();
            break;
          case 'Escape':
            ke.preventDefault();
            closeDropdown();
            break;
          case 'Tab':
            closeDropdown();
            break;
        }
      });
    });

    cleanupRef.current = () => {
      handlers.forEach(({ el, event, fn }) => el.removeEventListener(event, fn));
    };

    return () => cleanupRef.current?.();
  }, []);

  // Renders nothing — purely behavioral island
  return null;
}

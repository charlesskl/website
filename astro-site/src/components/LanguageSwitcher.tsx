import { useState, useEffect, useRef, useCallback } from 'react';

type Lang = 'en' | 'cn' | 'id';

interface Props {
  lang: Lang;
}

const languages = [
  { code: 'en' as const, label: 'English' },
  { code: 'cn' as const, label: '繁體中文' },
  { code: 'id' as const, label: 'Bahasa Indonesia' },
];

const langLabels: Record<Lang, string> = {
  en: 'EN',
  cn: '中文',
  id: 'ID',
};

export default function LanguageSwitcher({ lang }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const switchLang = useCallback(
    (targetLang: Lang) => {
      if (targetLang === lang) {
        setOpen(false);
        return;
      }

      // Save preference
      try {
        localStorage.setItem('rr-lang', targetLang);
      } catch {}

      // Compute new URL: strip current locale prefix, add new one
      let path = window.location.pathname;

      // Remove current locale prefix
      if (lang === 'cn') path = path.replace(/^\/cn(\/|$)/, '/');
      else if (lang === 'id') path = path.replace(/^\/id(\/|$)/, '/');

      // Add new locale prefix
      if (targetLang === 'cn') path = '/cn' + (path === '/' ? '/' : path);
      else if (targetLang === 'id') path = '/id' + (path === '/' ? '/' : path);

      window.location.href = path;
    },
    [lang]
  );

  return (
    <li className="has-dropdown lang-selector" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
      >
        {langLabels[lang]} <span className="arrow">&#8964;</span>
      </button>
      {open && (
        <ul className="dropdown lang-dropdown" style={{ display: 'block' }}>
          {languages.map((l) => (
            <li key={l.code}>
              <a
                href="#"
                data-lang={l.code}
                onClick={(e) => {
                  e.preventDefault();
                  switchLang(l.code);
                }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

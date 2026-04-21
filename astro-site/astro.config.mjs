// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://royalregentgroup.com',
  integrations: [react()],
  build: {
    format: 'file', // Preserve .html URLs to match original site structure
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'cn', 'id'],
    routing: {
      prefixDefaultLocale: false, // / = EN, /cn/ = 中文, /id/ = ID
    },
  },
});

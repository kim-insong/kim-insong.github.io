import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import remarkWikiLink from 'remark-wiki-link';

export default defineConfig({
  site: 'https://insong.net',
  integrations: [react()],
  markdown: {
    remarkPlugins: [
      [remarkWikiLink, {
        pageResolver: (name) => [name.toLowerCase().replace(/ /g, '-')],
        hrefTemplate: (permalink) => `/wiki/${permalink}`,
        aliasDivider: '|',
      }],
    ],
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
});

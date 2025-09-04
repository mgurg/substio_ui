// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {enabled: true},
  modules: ['@nuxt/eslint', '@nuxt/test-utils', '@nuxt/ui', '@nuxtjs/i18n', 'nuxt-umami'],
  css: ['~/assets/css/main.css'],

  app: {
      head: {
          title: 'Substytucje procesowe — najnowsze oferty | Katalog substytucji', // default fallback title
      }
  },

  i18n: {
      strategy: 'prefix_except_default',
      locales: [
          {code: 'pl', iso: 'pl-PL', name: 'Polski', file: 'pl.json'},
          // {code: 'en', iso: 'en-US', name: 'English', file: 'en.json'}
      ],
      defaultLocale: 'pl',
      langDir: 'locales',
      vueI18n: './i18n.config.ts'
  },

  router: {
      options: {
          linkActiveClass: "active",
          linkExactActiveClass: "exact-active"
      }
  },

  umami: {
      id: 'my-w3b517e-id',
      host: 'https://cloud.umami.is',
      autoTrack: true,
      // proxy: 'cloak',
      // useDirective: true,
      ignoreLocalhost: true,
      // excludeQueryParams: false,
      // domains: ['cool-site.app', 'my-space.site'],
      // customEndpoint: '/my-custom-endpoint',
      // enabled: false,
      // logErrors: true,
  },

  runtimeConfig: {
      // Private keys are only available on the server
      // apiSecret: '123'

      // Public keys that are exposed to the client
      public: {
          blogUrl: process.env.NUXT_PUBLIC_BLOG_URL || 'https://default-blog-url.com',
          baseDomain: process.env.NUXT_PUBLIC_DOMAIN || 'http://localhost:3000',
          apiBaseUrl: process.env.NUXT_BACKEND_API,
      }
  },

  future: {
      compatibilityVersion: 4,
  },
  // sentry: {
  //   sourceMapsUploadOptions: {
  //     org: 'subaro',
  //     project: 'javascript-nuxt',
  //   },
  // },
  //
  // sourcemap: {
  //   client: 'hidden',
  // },
})
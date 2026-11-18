// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Kanban Board',
      meta: [
        { name: 'description', content: 'In-memory Kanban task board' },
      ],
    },
  },
})

import { createAgent, registerTools } from "@ui-sdk/vue/agent"

export default defineNuxtPlugin(() => {
  const agent = createAgent({
    allow: (step) =>
      step.confirm ? window.confirm(step.confirm) : true,
  })

  registerTools(agent, { allow: () => true })

  if (import.meta.dev) {
    ;(window as Window & { __agent?: typeof agent }).__agent = agent
  }

  return {
    provide: {
      agent,
    },
  }
})

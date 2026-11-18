import { createAgent, registerTools } from "@ui-sdk/vue/agent"

export default defineNuxtPlugin(() => {
  const agent = createAgent({
    allow: (step) =>
      step.confirm ? window.confirm(step.confirm) : true,
  })

  registerTools(agent, { allow: () => true })

  return {
    provide: {
      agent,
    },
  }
})

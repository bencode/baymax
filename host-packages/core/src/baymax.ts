import type { BaymaxEvent } from '@baymax/shared'
import { createBaymaxSession } from './agent.ts'
import type { BaymaxConfig } from './config.ts'
import { toBaymaxEvent } from './events.ts'

export type Baymax = {
  model: string | undefined
  prompt: (text: string) => void
  subscribe: (listener: (event: BaymaxEvent) => void) => () => void
}

export const createBaymax = async (config: BaymaxConfig): Promise<Baymax> => {
  const session = await createBaymaxSession(config)
  const listeners = new Set<(event: BaymaxEvent) => void>()
  const emit = (event: BaymaxEvent) => {
    for (const listener of listeners) listener(event)
  }
  session.subscribe(e => {
    const event = toBaymaxEvent(e)
    if (event) emit(event)
  })

  return {
    model: session.model?.id,
    // Prompts sent mid-turn queue behind the current one; failures surface as error events.
    prompt: text => {
      const options = session.isStreaming ? { streamingBehavior: 'followUp' as const } : {}
      session.prompt(text, options).catch((error: unknown) => {
        console.error('prompt failed', error)
        emit({ type: 'error', message: error instanceof Error ? error.message : String(error) })
      })
    },
    subscribe: listener => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

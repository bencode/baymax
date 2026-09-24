import type { PolyaEvent } from '@polya/shared'
import { createPolyaSession } from './agent.ts'
import type { PolyaConfig } from './config.ts'
import { toPolyaEvent } from './events.ts'

export type Polya = {
  model: string | undefined
  prompt: (text: string) => void
  subscribe: (listener: (event: PolyaEvent) => void) => () => void
}

export const createPolya = async (config: PolyaConfig): Promise<Polya> => {
  const session = await createPolyaSession(config)
  const listeners = new Set<(event: PolyaEvent) => void>()
  const emit = (event: PolyaEvent) => {
    for (const listener of listeners) listener(event)
  }
  session.subscribe(e => {
    const event = toPolyaEvent(e)
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

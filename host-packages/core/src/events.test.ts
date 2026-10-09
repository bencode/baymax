import { expect, test } from 'bun:test'
import type { AgentSessionEvent } from '@earendil-works/pi-coding-agent'
import { toBaymaxEvent } from './events.ts'

const update = (assistantMessageEvent: unknown) =>
  ({ type: 'message_update', message: {}, assistantMessageEvent }) as AgentSessionEvent

test('streams assistant text deltas', () => {
  expect(toBaymaxEvent(update({ type: 'text_delta', delta: 'hi' }))).toEqual({
    type: 'text_delta',
    delta: 'hi',
  })
})

test('reports provider errors with their message', () => {
  const event = update({ type: 'error', reason: 'error', error: { errorMessage: '401' } })
  expect(toBaymaxEvent(event)).toEqual({ type: 'error', message: '401' })
})

test('ends a turn only when the agent will not retry', () => {
  const end = (willRetry: boolean) =>
    toBaymaxEvent({ type: 'agent_end', messages: [], willRetry } as AgentSessionEvent)
  expect(end(false)).toEqual({ type: 'turn_end' })
  expect(end(true)).toBeNull()
})

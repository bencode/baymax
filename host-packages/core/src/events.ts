import type { AgentSessionEvent } from '@earendil-works/pi-coding-agent'
import type { PolyaEvent } from '@polya/shared'

export const toPolyaEvent = (event: AgentSessionEvent): PolyaEvent | null => {
  if (event.type === 'message_update') {
    const e = event.assistantMessageEvent
    if (e.type === 'text_delta') return { type: 'text_delta', delta: e.delta }
    if (e.type === 'error') return { type: 'error', message: e.error.errorMessage ?? e.reason }
    return null
  }
  if (event.type === 'tool_execution_start') {
    return { type: 'tool_start', callId: event.toolCallId, name: event.toolName }
  }
  if (event.type === 'tool_execution_end') {
    return { type: 'tool_end', callId: event.toolCallId, isError: event.isError }
  }
  if (event.type === 'agent_end' && !event.willRetry) return { type: 'turn_end' }
  return null
}

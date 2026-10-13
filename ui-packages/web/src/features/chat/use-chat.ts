import type { BaymaxEvent } from '@baymax/shared'
import { useEffect, useState } from 'react'

export type ToolCall = { callId: string; name: string; status: 'running' | 'done' | 'failed' }
type AssistantMessage = { role: 'assistant'; text: string; tools: ToolCall[]; error?: string }
export type ChatMessage = { role: 'user'; text: string } | AssistantMessage

// Events extend the trailing assistant message, starting one if the last message is the user's.
const updateAssistant = (
  messages: ChatMessage[],
  update: (m: AssistantMessage) => AssistantMessage,
): ChatMessage[] => {
  const last = messages.at(-1)
  if (last?.role === 'assistant') return [...messages.slice(0, -1), update(last)]
  return [...messages, update({ role: 'assistant', text: '', tools: [] })]
}

export const applyEvent = (messages: ChatMessage[], event: BaymaxEvent): ChatMessage[] => {
  if (event.type === 'text_delta') {
    return updateAssistant(messages, m => ({ ...m, text: m.text + event.delta }))
  }
  if (event.type === 'tool_start') {
    const tool: ToolCall = { callId: event.callId, name: event.name, status: 'running' }
    return updateAssistant(messages, m => ({ ...m, tools: [...m.tools, tool] }))
  }
  if (event.type === 'tool_end') {
    const status = event.isError ? 'failed' : 'done'
    return updateAssistant(messages, m => ({
      ...m,
      tools: m.tools.map(t => (t.callId === event.callId ? { ...t, status } : t)),
    }))
  }
  if (event.type === 'error') {
    return updateAssistant(messages, m => ({ ...m, error: event.message }))
  }
  return messages
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const source = new EventSource('/api/events')
    source.onmessage = e => {
      // Host and UI ship in one build, so the wire shape is trusted.
      const event: BaymaxEvent = JSON.parse(e.data)
      if (event.type === 'turn_end' || event.type === 'error') setBusy(false)
      setMessages(prev => applyEvent(prev, event))
    }
    return () => source.close()
  }, [])

  const send = async (text: string) => {
    setMessages(prev => [...prev, { role: 'user', text }])
    setBusy(true)
    const res = await fetch('/api/prompt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) {
      setBusy(false)
      setMessages(prev => applyEvent(prev, { type: 'error', message: `HTTP ${res.status}` }))
    }
  }

  return { messages, busy, send }
}

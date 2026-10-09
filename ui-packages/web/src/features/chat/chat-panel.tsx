import { type FormEvent, useState } from 'react'
import { type ChatMessage, useChat } from './use-chat.ts'

const toolMark = { running: '…', done: '✓', failed: '✗' } as const

const Message = ({ message }: { message: ChatMessage }) =>
  message.role === 'user' ? (
    <div className="self-end rounded-lg bg-stone-200 px-3 py-2 whitespace-pre-wrap">
      {message.text}
    </div>
  ) : (
    <div className="flex flex-col gap-1">
      {message.tools.map(t => (
        <div key={t.callId} className="font-mono text-xs text-stone-500">
          {toolMark[t.status]} {t.name}
        </div>
      ))}
      {message.text && <div className="whitespace-pre-wrap">{message.text}</div>}
      {message.error && <div className="text-sm text-red-600">{message.error}</div>}
    </div>
  )

export const ChatPanel = () => {
  const { messages, busy, send } = useChat()
  const [draft, setDraft] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setDraft('')
    void send(text)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 text-sm leading-relaxed">
        {messages.map((m, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
          <Message key={i} message={m} />
        ))}
        {busy && <div className="text-xs text-stone-400">Thinking…</div>}
      </div>
      <form onSubmit={submit} className="border-t border-stone-200 p-3">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Ask Baymax…"
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
        />
      </form>
    </div>
  )
}

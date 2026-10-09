export type PromptRequest = { text: string }

export type BaymaxEvent =
  | { type: 'text_delta'; delta: string }
  | { type: 'tool_start'; callId: string; name: string }
  | { type: 'tool_end'; callId: string; isError: boolean }
  | { type: 'turn_end' }
  | { type: 'error'; message: string }

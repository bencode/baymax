import type { Polya } from '@polya/core'
import type { PolyaEvent, PromptRequest } from '@polya/shared'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { streamSSE } from 'hono/streaming'
import { z } from 'zod'

const promptRequest: z.ZodType<PromptRequest> = z.object({ text: z.string().min(1) })

export const createApp = (polya: Polya, webDir?: string): Hono => {
  const api = new Hono()
    .post('/prompt', async c => {
      const parsed = promptRequest.safeParse(await c.req.json())
      if (!parsed.success) return c.json({ error: parsed.error.message }, 400)
      polya.prompt(parsed.data.text)
      return c.body(null, 202)
    })
    .get('/events', c =>
      streamSSE(c, async stream => {
        const send = (event: PolyaEvent) => void stream.writeSSE({ data: JSON.stringify(event) })
        const unsubscribe = polya.subscribe(send)
        const keepalive = setInterval(
          () => void stream.writeSSE({ event: 'ping', data: '' }),
          30_000,
        )
        await new Promise<void>(resolve => stream.onAbort(resolve))
        clearInterval(keepalive)
        unsubscribe()
      }),
    )

  const app = new Hono().route('/api', api)
  if (webDir) {
    app.use('/*', serveStatic({ root: webDir }))
    app.get('*', serveStatic({ path: `${webDir}/index.html` }))
  }
  return app
}

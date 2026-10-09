import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { resolveConfig } from './config.ts'

// A release build ships web/ and skills/ next to the executable; dev runs from the repo.
const exeDir = dirname(process.execPath)
const releaseWebDir = join(exeDir, 'web')
const isRelease = existsSync(join(releaseWebDir, 'index.html'))
const appDir = isRelease ? exeDir : resolve(import.meta.dir, '../../..')

const config = resolveConfig({
  env: process.env,
  argv: process.argv.slice(2),
  cwd: process.cwd(),
  homedir: homedir(),
  platform: process.platform,
  seedDir: join(appDir, 'skills'),
})

// pi resolves some paths from this variable at import time, so set it before importing pi.
process.env.PI_CODING_AGENT_DIR = config.agentDir

const { createBaymax } = await import('@baymax/core')
const { createApp } = await import('./app.ts')

const baymax = await createBaymax(config)
const app = createApp(baymax, isRelease ? releaseWebDir : undefined)
// Loopback only: the agent can read and write local files.
const server = Bun.serve({
  hostname: '127.0.0.1',
  port: config.port,
  fetch: app.fetch,
  idleTimeout: 0,
})
const url = `http://127.0.0.1:${server.port}`
console.log(`Baymax on ${url} · project ${config.projectDir} · model ${baymax.model ?? 'none'}`)

if (isRelease) {
  const opener = { darwin: ['open'], win32: ['cmd', '/c', 'start', ''] }[process.platform as string]
  Bun.spawn([...(opener ?? ['xdg-open']), url])
}

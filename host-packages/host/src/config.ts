import { join } from 'node:path'
import { type BaymaxConfig, skillPathsFor, toolsFor } from '@baymax/core/config'

export type HostConfig = BaymaxConfig & { port: number }

type Env = Record<string, string | undefined>

// "provider/model-id"; the id itself may contain slashes (e.g. openrouter models).
export const parseModel = (spec: string | undefined): BaymaxConfig['model'] => {
  const slash = spec?.indexOf('/') ?? -1
  if (!spec || slash <= 0 || slash === spec.length - 1) return undefined
  return { provider: spec.slice(0, slash), id: spec.slice(slash + 1) }
}

export const resolveConfig = (input: {
  env: Env
  argv: string[]
  cwd: string
  homedir: string
  platform: NodeJS.Platform
  seedDir: string
}): HostConfig => {
  const home = input.env.BAYMAX_HOME ?? join(input.homedir, '.baymax')
  const projectDir = input.argv[0] ?? input.cwd
  return {
    home,
    agentDir: join(home, 'agent'),
    projectDir,
    skillPaths: skillPathsFor(projectDir, home, input.seedDir),
    model: parseModel(input.env.BAYMAX_MODEL),
    tools: toolsFor(input.platform),
    port: Number(input.env.BAYMAX_PORT ?? 41650),
  }
}

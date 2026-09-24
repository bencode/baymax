import { existsSync } from 'node:fs'
import { join } from 'node:path'
import {
  type AgentSession,
  createAgentSession,
  DefaultResourceLoader,
  ModelRuntime,
  SessionManager,
  SettingsManager,
} from '@earendil-works/pi-coding-agent'
import type { PolyaConfig } from './config.ts'

export const createPolyaSession = async (config: PolyaConfig): Promise<AgentSession> => {
  const { agentDir, projectDir: cwd } = config
  const modelRuntime = await ModelRuntime.create({
    authPath: join(agentDir, 'auth.json'),
    modelsPath: join(agentDir, 'models.json'),
  })
  const model = config.model && modelRuntime.getModel(config.model.provider, config.model.id)
  if (config.model && !model) {
    throw new Error(`Unknown model: ${config.model.provider}/${config.model.id}`)
  }
  const settingsManager = SettingsManager.create(cwd, agentDir)
  const resourceLoader = new DefaultResourceLoader({
    cwd,
    agentDir,
    settingsManager,
    noSkills: true,
    additionalSkillPaths: config.skillPaths.filter(p => existsSync(p)),
    noExtensions: true,
    noPromptTemplates: true,
    noThemes: true,
  })
  await resourceLoader.reload()
  const { session } = await createAgentSession({
    cwd,
    agentDir,
    modelRuntime,
    model: model || undefined,
    resourceLoader,
    settingsManager,
    tools: config.tools,
    sessionManager: SessionManager.create(cwd, join(agentDir, 'sessions')),
  })
  return session
}

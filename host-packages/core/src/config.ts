// Pure configuration policy. Importing this module must not load pi (see host main.ts).
import { join } from 'node:path'

export type BaymaxConfig = {
  home: string
  agentDir: string
  projectDir: string
  skillPaths: string[]
  model?: { provider: string; id: string }
  tools: string[]
}

// PowerShell on Windows so Git for Windows is not a prerequisite.
export const toolsFor = (platform: NodeJS.Platform): string[] => [
  'read',
  platform === 'win32' ? 'powershell' : 'bash',
  'edit',
  'write',
  'ls',
]

// Earlier paths win on skill name collisions: project > user > seed.
export const skillPathsFor = (projectDir: string, home: string, seedDir: string): string[] => [
  join(projectDir, '.baymax', 'skills'),
  join(home, 'skills'),
  seedDir,
]

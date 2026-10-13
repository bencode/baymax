// Builds self-contained release folders: release/<target>/{baymax[.exe], web/, photon_rs_bg.wasm, package.json}
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { $ } from 'bun'

const root = join(import.meta.dir, '..')
const targets = [
  { name: 'darwin-arm64', bun: 'bun-darwin-arm64', exe: 'baymax' },
  { name: 'windows-x64', bun: 'bun-windows-x64-baseline', exe: 'baymax.exe' },
]

// pi reads package.json next to the binary for its app name and config dir.
const manifest = { name: 'baymax', piConfig: { name: 'baymax', configDir: '.baymax' } }

const piEntry = Bun.resolveSync('@earendil-works/pi-coding-agent', join(root, 'host-packages/core'))
const photonPackage = Bun.resolveSync('@silvia-odwyer/photon-node/package.json', dirname(piEntry))
const photonWasm = join(dirname(photonPackage), 'photon_rs_bg.wasm')

await $`pnpm --filter @baymax/web build`.cwd(root)

for (const target of targets) {
  const out = join(root, 'release', target.name)
  await rm(out, { recursive: true, force: true })
  await mkdir(out, { recursive: true })
  await $`bun build --compile --no-compile-autoload-bunfig --target=${target.bun} --outfile ${join(out, target.exe)} host-packages/host/src/main.ts`.cwd(
    root,
  )
  await cp(join(root, 'ui-packages/web/dist'), join(out, 'web'), { recursive: true })
  await cp(photonWasm, join(out, 'photon_rs_bg.wasm'))
  await writeFile(join(out, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`built ${out}`)
}

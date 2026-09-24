# AGENTS.md

Pólya: a self-growing, everyday agent assistant for researchers and educators, built on
[pi](https://github.com/earendil-works/pi). See README.md for the idea.

## Runtime model

Pólya is a client application. Everything the user works with runs on the user's machine:

```text
polya[.exe]  (Bun, bun --compile)
  host   loopback HTTP + SSE, serves the web build, opens the browser   (thin)
  core   pi session, primitives (tools), skills, knowledge, projects     (everything else)
browser (later: Tauri webview)  →  web
```

Development uses the same runtime: `bun --watch` runs host + core, Vite serves web with HMR.
A remote server may come later, limited to an LLM proxy (metering, billing), skill hosting and
release hosting.

Data boundary:

```text
server storage ⊆ { account, usage records, skill packages, release artifacts }
user files, notes, sessions, knowledge ∉ server storage
LLM proxy: forwards request bodies without storing or logging them; records token usage only
```

## Layout

Packages are grouped by where they run.

```text
packages/          isomorphic
  shared/          types shared by host and web (types only: no runtime code)
ui-packages/       client · interface
  web/             React 19 + Vite + Tailwind v4
host-packages/     client · local process (Bun)
  core/            embeds pi via its SDK; all capabilities live here; knows nothing about HTTP
  host/            loopback HTTP/SSE adapter over core; no domain decisions
server-packages/   remote (not created yet): LLM proxy, skill hosting, release hosting
scripts/
  build-release.ts bun --compile → release/<target>/ (binary, web/, photon wasm, package.json)
priv/              local-only material (requirements, designs); git-ignored, never committed
```

Package dependencies. Each set is complete; adding an edge is a deliberate act.

```clojure
{:shared #{}
 :core   #{:shared}
 :host   #{:core :shared}
 :web    #{:shared}
 :server #{}}   ; talks to the client over HTTP only
```

`@polya/core/config` is pure and never loads pi: `host` imports it before setting
`PI_CODING_AGENT_DIR`, then imports `@polya/core` dynamically.

Layers inside `web/src`:

```clojure
{:ui #{} :core #{:ui} :parts #{:ui :core}
 :features #{:ui :core :parts} :shell #{:ui :core :parts :features}}
```

`ui/` knows no domain types. Features never import each other or `shell/`.
Split a package out only when it gains a second consumer; merge it back when it loses one.

## Commands

```sh
pnpm install
pnpm dev:host        # host on http://127.0.0.1:41650  (args: [projectDir]; env: POLYA_MODEL=provider/id, POLYA_HOME, POLYA_PORT)
pnpm dev:web         # web on http://localhost:41651  (/api proxied to the host)
pnpm check           # biome + typecheck + tests
pnpm build:release   # darwin-arm64 and windows-x64 builds under release/
```

Requires Bun ≥ 1.3 (pi uses `process.getBuiltinModule`).

## Conventions

- Everything in this repository is written in English.
- The host binds 127.0.0.1 only.
- Data lives under `~/.polya` (`POLYA_HOME`); pi's own `~/.pi` is never touched.
- Skills load in priority order: project `.polya/skills` > user `~/.polya/skills` > seed `skills/`.
- Domain logic belongs in skills, never in primitives.
- Internal packages export source (`"exports": { ".": "./src/index.ts" }`); only release builds compile.
- Tests sit next to the code (`*.test.ts`) and check observable behavior.
- Commit per completed phase, with clear boundaries; do not commit every small edit.

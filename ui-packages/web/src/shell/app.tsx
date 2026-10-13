import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { ChatPanel } from '../features/chat/chat-panel.tsx'

export const App = () => (
  <PanelGroup
    direction="horizontal"
    autoSaveId="baymax-main"
    className="bg-stone-50 text-stone-800"
  >
    <Panel defaultSize={60} minSize={30}>
      <div className="flex h-full items-center justify-center text-sm text-stone-400">Reader</div>
    </Panel>
    <PanelResizeHandle className="w-px bg-stone-200" />
    <Panel defaultSize={40} minSize={25}>
      <ChatPanel />
    </Panel>
  </PanelGroup>
)

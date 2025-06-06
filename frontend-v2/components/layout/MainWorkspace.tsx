'use client'

import { useState } from 'react'
import { MessageCircle, Code2, FileText, Eye, Terminal, Layout, Maximize2 } from 'lucide-react'
import ChatInterface from '@/components/workspace/ChatInterface'
import CodeEditor from '@/components/workspace/CodeEditor'
import FilesPanel from '@/components/workspace/FilesPanel'
import PreviewPanel from '@/components/workspace/PreviewPanel'
import TerminalPanel from '@/components/workspace/TerminalPanel'

type TabType = 'chat' | 'editor' | 'files' | 'preview' | 'terminal'

export default function MainWorkspace() {
  const [activeTab, setActiveTab] = useState<TabType>('chat')

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: MessageCircle, component: ChatInterface },
    { id: 'editor', label: 'Code Editor', icon: Code2, component: CodeEditor },
    { id: 'files', label: 'Files', icon: FileText, component: FilesPanel },
    { id: 'preview', label: 'Preview', icon: Eye, component: PreviewPanel },
    { id: 'terminal', label: 'Terminal', icon: Terminal, component: TerminalPanel },
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ChatInterface

  return (
    <main className="flex-1 flex flex-col bg-gray-950">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-blue-400 bg-blue-500/10'
                    : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex items-center space-x-2 px-4">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <Layout className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <ActiveComponent />
      </div>
    </main>
  )
}
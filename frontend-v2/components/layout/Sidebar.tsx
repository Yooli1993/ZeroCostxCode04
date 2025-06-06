'use client'

import { useState } from 'react'
import { Plus, Upload, Folder, History, Cpu, Search, MoreHorizontal } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [activeProject, setActiveProject] = useState('E-commerce App')

  if (!isOpen) return null

  return (
    <aside className="w-80 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 flex flex-col">
      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex space-x-2">
          <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span className="font-medium">New Project</span>
          </button>
          <button className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Project Explorer */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-200">Projects</h3>
            <button className="p-1 text-gray-400 hover:text-white rounded">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 cursor-pointer hover:bg-gray-800 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Folder className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-gray-200">E-commerce App</span>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>07:27 AM</span>
                <div className="flex items-center space-x-1">
                  <Cpu className="w-3 h-3" />
                  <span>3 agents</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-200">Recent Sessions</h3>
            <button className="p-1 text-gray-400 hover:text-white rounded">
              <History className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-400">
            No recent sessions
          </div>
        </div>

        {/* Agent Status */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-200">Agent Status</h3>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-400">0</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-400">0</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-gray-400">0</span>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {/* Coding Agent */}
            <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">Coding Agent</span>
              </div>
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            </div>

            {/* Research Agent */}
            <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Research Agent</span>
              </div>
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            </div>

            {/* Testing Agent */}
            <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Testing Agent</span>
              </div>
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
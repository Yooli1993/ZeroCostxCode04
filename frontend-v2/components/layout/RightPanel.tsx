'use client'

import { useState } from 'react'
import { Activity, Clock, RefreshCw, Zap, Cpu, CheckCircle, Save, Play, Upload, GitBranch } from 'lucide-react'

interface RightPanelProps {
  isOpen: boolean
}

export default function RightPanel({ isOpen }: RightPanelProps) {
  const [activeView, setActiveView] = useState<'live' | 'timeline'>('live')

  if (!isOpen) return null

  return (
    <aside className="w-80 bg-gray-900/50 backdrop-blur-sm border-l border-gray-800 flex flex-col">
      {/* Agent Transparency Window */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-200">Agent Transparency</h3>
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveView('live')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeView === 'live'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setActiveView('timeline')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeView === 'timeline'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-gray-400 text-center py-8">
            No active agents
          </div>
        </div>
      </div>

      {/* Current Context */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-200">Current Context</h3>
          <button className="p-1 text-gray-400 hover:text-white rounded">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-400 mb-1">Project Type</div>
            <div className="text-sm text-gray-200">web</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Current Files</div>
            <div className="text-sm text-gray-400">No files selected</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Active Agents</div>
            <div className="text-sm text-gray-400">None</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">Performance</h3>
        
        <div className="space-y-3">
          {/* Response Time */}
          <div className="bg-gray-800/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Response Time</span>
              </div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-semibold text-white">1116</span>
              <span className="text-xs text-gray-400">ms</span>
            </div>
            <div className="flex items-center space-x-1 mt-1">
              <div className="w-3 h-3 text-green-400">↗</div>
              <span className="text-xs text-green-400">-12% vs last hour</span>
            </div>
          </div>

          {/* Efficiency */}
          <div className="bg-gray-800/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Efficiency</span>
              </div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-semibold text-white">94</span>
              <span className="text-xs text-gray-400">%</span>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-gray-800/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Success Rate</span>
              </div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-semibold text-white">97.2</span>
              <span className="text-xs text-gray-400">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <button className="flex flex-col items-center space-y-2 p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors">
            <Save className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-gray-300">Save</span>
          </button>
          
          <button className="flex flex-col items-center space-y-2 p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors">
            <Play className="w-5 h-5 text-green-400" />
            <span className="text-xs text-gray-300">Run</span>
          </button>
          
          <button className="flex flex-col items-center space-y-2 p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors">
            <Upload className="w-5 h-5 text-orange-400" />
            <span className="text-xs text-gray-300">Deploy</span>
          </button>
          
          <button className="flex flex-col items-center space-y-2 p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors">
            <GitBranch className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-gray-300">Branch</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
'use client'

import { Search, Bell, Settings, RefreshCw, Code2 } from 'lucide-react'

interface HeaderProps {
  onToggleSidebar: () => void
  onToggleRightPanel: () => void
}

export default function Header({ onToggleSidebar, onToggleRightPanel }: HeaderProps) {
  return (
    <header className="h-16 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between px-4 z-50">
      {/* Left Section */}
      <div className="flex items-center space-x-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white">ZeroCostxCode</h1>
            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
              v2.0.0
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <button className="px-4 py-2 text-sm font-medium text-blue-400 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <span className="flex items-center space-x-2">
              <Code2 className="w-4 h-4" />
              <span>Workspace</span>
            </span>
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            Deploy
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            Monitor
          </button>
        </nav>
      </div>

      {/* Center Section - Search */}
      <div className="hidden lg:flex items-center max-w-md w-full mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, sessions, docs..."
            className="w-full pl-10 pr-12 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs text-gray-400 bg-gray-700 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* System Status */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-400">Offline</span>
          </div>
          <div className="text-sm text-gray-400">
            <span className="text-white font-medium">1116</span>ms avg
          </div>
        </div>

        {/* Action Buttons */}
        <button 
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          title="Refresh Status"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        {/* User Menu */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">U</span>
          </div>
        </div>
      </div>
    </header>
  )
}
'use client'

import { useState, useRef, useEffect } from 'react'
import { Terminal, X, Plus, Download, Copy } from 'lucide-react'

export default function TerminalPanel() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<Array<{ command: string; output: string; timestamp: Date }>>([
    {
      command: 'npm --version',
      output: '10.2.4',
      timestamp: new Date(Date.now() - 60000)
    },
    {
      command: 'node --version', 
      output: 'v20.11.0',
      timestamp: new Date(Date.now() - 30000)
    }
  ])
  const [currentPath] = useState('~/ZeroCostxCode04')
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const handleCommand = (command: string) => {
    if (!command.trim()) return

    let output = ''
    
    // Simulate command responses
    switch (command.toLowerCase().trim()) {
      case 'ls':
      case 'dir':
        output = 'frontend-v2/  backend-v2/  README.md  package.json  docker-compose.yml'
        break
      case 'pwd':
        output = '/workspace/ZeroCostxCode04'
        break
      case 'whoami':
        output = 'developer'
        break
      case 'date':
        output = new Date().toString()
        break
      case 'clear':
        setHistory([])
        setInput('')
        return
      case 'help':
        output = `Available commands:
  ls, dir     - List directory contents
  pwd         - Print working directory  
  whoami      - Current user
  date        - Current date and time
  clear       - Clear terminal
  help        - Show this help message
  npm         - Node package manager
  git         - Git version control`
        break
      default:
        if (command.startsWith('npm ')) {
          output = `npm command executed: ${command}`
        } else if (command.startsWith('git ')) {
          output = `git command executed: ${command}`
        } else {
          output = `Command not found: ${command}`
        }
    }

    setHistory(prev => [...prev, {
      command,
      output,
      timestamp: new Date()
    }])
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center space-x-3">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-gray-200">Terminal</span>
          <span className="text-xs text-gray-400">bash</span>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-gray-950"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Command History */}
        {history.map((entry, index) => (
          <div key={index} className="mb-2">
            {/* Command */}
            <div className="flex items-center space-x-2 text-green-400">
              <span className="text-blue-400">developer@zerocostxcode</span>
              <span className="text-gray-400">:</span>
              <span className="text-purple-400">{currentPath}</span>
              <span className="text-gray-400">$</span>
              <span className="text-gray-100">{entry.command}</span>
              <span className="text-xs text-gray-500 ml-auto">
                {formatTime(entry.timestamp)}
              </span>
            </div>
            
            {/* Output */}
            {entry.output && (
              <div className="mt-1 text-gray-300 whitespace-pre-wrap">
                {entry.output}
              </div>
            )}
          </div>
        ))}

        {/* Current Input Line */}
        <div className="flex items-center space-x-2 text-green-400">
          <span className="text-blue-400">developer@zerocostxcode</span>
          <span className="text-gray-400">:</span>
          <span className="text-purple-400">{currentPath}</span>
          <span className="text-gray-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-gray-100 outline-none"
            placeholder="Type a command..."
            autoFocus
          />
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-800 bg-gray-900/50 text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Shell: bash</span>
          <span>Encoding: UTF-8</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Lines: {history.length + 1}</span>
          <span>Connected</span>
        </div>
      </div>
    </div>
  )
}
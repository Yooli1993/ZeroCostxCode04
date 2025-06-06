'use client'

import { useState } from 'react'
import { Send, Paperclip, Mic, Cpu, Settings } from 'lucide-react'

export default function ChatInterface() {
  const [message, setMessage] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  const suggestions = [
    "Create a REST API for user management",
    "Add authentication to my app", 
    "Deploy to production"
  ]

  const handleSend = () => {
    if (!message.trim()) return
    setIsThinking(true)
    // Simulate AI response
    setTimeout(() => setIsThinking(false), 2000)
    setMessage('')
  }

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">AI Development Assistant</h2>
            <p className="text-sm text-gray-400">DeepSeek R1 • Real-time Mode</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200">
              <option value="deepseek-r1">DeepSeek R1</option>
              <option value="claude-3.5">Claude 3.5 Sonnet</option>
              <option value="gpt-4">GPT-4</option>
            </select>
            
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Message */}
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Welcome to ZeroCostxCode AI Assistant
            </h3>
            <p className="text-gray-400 mb-6">
              I'm here to help you build amazing applications. What would you like to create today?
            </p>
          </div>

          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-400">Analyzing requirements and planning implementation...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          {/* Suggestion Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setMessage(suggestion)}
                className="px-3 py-2 text-sm bg-gray-800/50 hover:bg-gray-800 text-gray-300 rounded-full border border-gray-700 transition-colors"
              >
                "{suggestion}"
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="flex items-end space-x-3">
            {/* Toolbar */}
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <Mic className="w-5 h-5" />
              </button>
            </div>

            {/* Input */}
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what you want to build..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!message.trim() || isThinking}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
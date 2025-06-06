'use client'

import { useEffect, useRef, useState } from 'react'
import { Save, Settings, Search, MoreHorizontal } from 'lucide-react'

export default function CodeEditor() {
  const editorRef = useRef<HTMLDivElement>(null)
  const [monaco, setMonaco] = useState<any>(null)
  const [editor, setEditor] = useState<any>(null)

  useEffect(() => {
    // Dynamically import Monaco Editor
    import('@monaco-editor/react').then((Monaco) => {
      if (editorRef.current) {
        const editorInstance = Monaco.default.create(editorRef.current, {
          value: `// Welcome to ZeroCostxCode Editor
// Start building your next amazing project!

function HelloWorld() {
  return (
    <div className="container">
      <h1>Hello, ZeroCostxCode!</h1>
      <p>Ready to build something amazing?</p>
    </div>
  );
}

export default HelloWorld;`,
          language: 'typescript',
          theme: 'vs-dark',
          fontSize: 14,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
        })
        
        setEditor(editorInstance)
      }
    })

    return () => {
      if (editor) {
        editor.dispose()
      }
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-300">main.tsx</span>
          </div>
          <div className="text-xs text-gray-500">TypeScript React</div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <Search className="w-4 h-4" />
          </button>
          
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 relative">
        <div 
          ref={editorRef} 
          className="absolute inset-0"
          style={{ 
            backgroundColor: '#0d1117',
          }}
        />
      </div>

      {/* Editor Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-800 bg-gray-900/50 text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Ln 1, Col 1</span>
          <span>UTF-8</span>
          <span>TypeScript React</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Spaces: 2</span>
          <span>Auto Save: On</span>
        </div>
      </div>
    </div>
  )
}
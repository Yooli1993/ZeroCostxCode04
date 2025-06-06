'use client'

import { useState } from 'react'
import { Folder, File, Search, Plus, MoreHorizontal, ChevronRight, ChevronDown } from 'lucide-react'

interface FileNode {
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
  expanded?: boolean
}

export default function FilesPanel() {
  const [searchTerm, setSearchTerm] = useState('')
  const [fileTree, setFileTree] = useState<FileNode[]>([
    {
      name: 'src',
      type: 'folder',
      expanded: true,
      children: [
        {
          name: 'components',
          type: 'folder',
          expanded: true,
          children: [
            { name: 'Header.tsx', type: 'file' },
            { name: 'Sidebar.tsx', type: 'file' },
            { name: 'MainContent.tsx', type: 'file' },
          ]
        },
        {
          name: 'pages',
          type: 'folder',
          expanded: false,
          children: [
            { name: 'index.tsx', type: 'file' },
            { name: 'about.tsx', type: 'file' },
          ]
        },
        { name: 'App.tsx', type: 'file' },
        { name: 'main.tsx', type: 'file' },
      ]
    },
    {
      name: 'public',
      type: 'folder',
      expanded: false,
      children: [
        { name: 'favicon.ico', type: 'file' },
        { name: 'logo.svg', type: 'file' },
      ]
    },
    { name: 'package.json', type: 'file' },
    { name: 'tsconfig.json', type: 'file' },
    { name: 'README.md', type: 'file' },
  ])

  const toggleFolder = (path: number[]) => {
    const newTree = [...fileTree]
    let current: any = newTree
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]].children
    }
    
    current[path[path.length - 1]].expanded = !current[path[path.length - 1]].expanded
    setFileTree(newTree)
  }

  const renderFileNode = (node: FileNode, depth: number = 0, path: number[] = []) => {
    const isFolder = node.type === 'folder'
    const hasChildren = node.children && node.children.length > 0
    
    return (
      <div key={node.name}>
        <div
          className={`flex items-center space-x-2 px-2 py-1 hover:bg-gray-800/50 cursor-pointer rounded-lg transition-colors`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => isFolder && toggleFolder([...path])}
        >
          {isFolder && hasChildren && (
            node.expanded ? 
              <ChevronDown className="w-4 h-4 text-gray-400" /> :
              <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          {isFolder && !hasChildren && <div className="w-4 h-4" />}
          
          {isFolder ? (
            <Folder className="w-4 h-4 text-blue-400" />
          ) : (
            <File className="w-4 h-4 text-gray-400" />
          )}
          
          <span className={`text-sm ${isFolder ? 'text-gray-200' : 'text-gray-300'}`}>
            {node.name}
          </span>
        </div>
        
        {isFolder && node.expanded && node.children && (
          <div>
            {node.children.map((child, index) => 
              renderFileNode(child, depth + 1, [...path, index])
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Files Header */}
      <div className="p-3 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-200">Explorer</h3>
          <div className="flex items-center space-x-1">
            <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
              <Plus className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {fileTree.map((node, index) => renderFileNode(node, 0, [index]))}
        </div>
      </div>

      {/* Files Footer */}
      <div className="p-3 border-t border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>12 files</span>
          <span>3 folders</span>
        </div>
      </div>
    </div>
  )
}
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface WorkspaceContextType {
  currentProject: string | null
  setCurrentProject: (project: string | null) => void
  activeFiles: string[]
  openFile: (file: string) => void
  closeFile: (file: string) => void
  isConnected: boolean
  setIsConnected: (connected: boolean) => void
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<string | null>(null)
  const [activeFiles, setActiveFiles] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const openFile = (file: string) => {
    setActiveFiles(prev => {
      if (!prev.includes(file)) {
        return [...prev, file]
      }
      return prev
    })
  }

  const closeFile = (file: string) => {
    setActiveFiles(prev => prev.filter(f => f !== file))
  }

  return (
    <WorkspaceContext.Provider value={{
      currentProject,
      setCurrentProject,
      activeFiles,
      openFile,
      closeFile,
      isConnected,
      setIsConnected
    }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}
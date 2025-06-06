'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface Agent {
  id: string
  name: string
  status: 'idle' | 'running' | 'completed' | 'error'
  task?: string
  progress?: number
}

interface AgentContextType {
  agents: Agent[]
  addAgent: (agent: Omit<Agent, 'id'>) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  removeAgent: (id: string) => void
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([])

  const addAgent = (agent: Omit<Agent, 'id'>) => {
    const newAgent: Agent = {
      ...agent,
      id: Math.random().toString(36).substr(2, 9)
    }
    setAgents(prev => [...prev, newAgent])
  }

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(agent => 
      agent.id === id ? { ...agent, ...updates } : agent
    ))
  }

  const removeAgent = (id: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== id))
  }

  return (
    <AgentContext.Provider value={{ agents, addAgent, updateAgent, removeAgent }}>
      {children}
    </AgentContext.Provider>
  )
}

export function useAgents() {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentProvider')
  }
  return context
}
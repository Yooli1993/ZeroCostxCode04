'use client'

import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import MainWorkspace from './MainWorkspace'
import RightPanel from './RightPanel'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100">
      {/* Header */}
      <Header 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
      />
      
      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} />
        
        {/* Main Workspace */}
        <MainWorkspace />
        
        {/* Right Panel */}
        <RightPanel isOpen={rightPanelOpen} />
      </div>
    </div>
  )
}
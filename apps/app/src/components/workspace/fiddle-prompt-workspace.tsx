"use client"

import { useState } from "react"
import { Button } from "@v1/ui/button"
import { Play, Square, Share2, Settings, ChevronLeft, ChevronRight, Plus, FileText } from "lucide-react"
import { LeftPanel } from "./left-panel"
import { MainEditor } from "./main-editor"
import { RightPanel } from "./right-panel"
import { TopToolbar } from "./top-toolbar"

export function FiddlePromptWorkspace() {
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  return (
    <div className='h-screen w-screen flex flex-col bg-background'>
      {/* Top Toolbar */}
      <TopToolbar isRunning={isRunning} onRun={() => setIsRunning(true)} onStop={() => setIsRunning(false)} />

      {/* Main Content Area */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Left Panel */}
        <div className={`${isLeftPanelCollapsed ? "w-12" : "w-64"} transition-all duration-200 border-r border-border`}>
          <LeftPanel
            isCollapsed={isLeftPanelCollapsed}
            onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
          />
        </div>

        {/* Main Editor Panel */}
        <div className='flex-1 flex flex-col min-w-0'>
          <MainEditor />
        </div>

        {/* Right Panel */}
        <div
          className={`${isRightPanelCollapsed ? "w-12" : "w-80"} transition-all duration-200 border-l border-border`}>
          <RightPanel
            isCollapsed={isRightPanelCollapsed}
            onToggle={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
          />
        </div>
      </div>
    </div>
  )
}

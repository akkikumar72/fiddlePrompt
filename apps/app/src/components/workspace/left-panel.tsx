"use client"

import { Button } from "@v1/ui/button"
import { ScrollArea } from "@v1/ui/scroll-area"
import { ChevronLeft, ChevronRight, Plus, FileText, Star, Trash2, HelpCircle, MessageSquare } from "lucide-react"

interface LeftPanelProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function LeftPanel({ isCollapsed, onToggle }: LeftPanelProps) {
  const savedPrompts = [
    { id: 1, name: "Blog Post Generator", starred: true },
    { id: 2, name: "Code Reviewer", starred: false },
    { id: 3, name: "Email Subject Lines", starred: true },
    { id: 4, name: "Product Descriptions", starred: false }
  ]

  if (isCollapsed) {
    return (
      <div className='h-full bg-muted/50 flex flex-col'>
        <div className='p-3 border-b border-border'>
          <Button variant='ghost' size='sm' onClick={onToggle} className='w-full justify-center'>
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>

        <div className='flex-1 flex flex-col items-center gap-2 p-2'>
          <Button variant='ghost' size='sm' className='w-8 h-8 p-0'>
            <Plus className='w-4 h-4' />
          </Button>
          <Button variant='ghost' size='sm' className='w-8 h-8 p-0'>
            <FileText className='w-4 h-4' />
          </Button>
        </div>

        <div className='border-t border-border p-2 space-y-1'>
          <Button variant='ghost' size='sm' className='w-8 h-8 p-0'>
            <HelpCircle className='w-4 h-4' />
          </Button>
          <Button variant='ghost' size='sm' className='w-8 h-8 p-0'>
            <MessageSquare className='w-4 h-4' />
          </Button>
          <Button variant='ghost' size='sm' className='w-8 h-8 p-0'>
            <Trash2 className='w-4 h-4' />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='h-full bg-muted/50 flex flex-col'>
      {/* Header */}
      <div className='p-4 border-b border-border'>
        <div className='flex items-center justify-between'>
          <h2 className='font-semibold text-sm text-muted-foreground tracking-wide uppercase'>FILES</h2>
          <Button variant='ghost' size='sm' onClick={onToggle} className='w-6 h-6 p-0'>
            <ChevronLeft className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* New Prompt Button */}
      <div className='p-4 border-b border-border'>
        <Button className='w-full gap-2' size='sm'>
          <Plus className='w-4 h-4' />
          New Prompt
        </Button>
      </div>

      {/* Saved Prompts */}
      <ScrollArea className='flex-1'>
        <div className='p-2'>
          <div className='text-xs font-medium text-muted-foreground mb-2 px-2'>Saved Prompts</div>
          <div className='space-y-1'>
            {savedPrompts.map(prompt => (
              <Button key={prompt.id} variant='ghost' className='w-full justify-between h-auto p-2 hover:bg-accent'>
                <div className='flex items-center gap-2'>
                  <FileText className='w-4 h-4 text-muted-foreground' />
                  <span className='text-sm truncate'>{prompt.name}</span>
                </div>
                {prompt.starred && <Star className='w-3 h-3 text-yellow-500 fill-current' />}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer Utilities */}
      <div className='border-t border-border p-2 space-y-1'>
        <Button variant='ghost' size='sm' className='w-full justify-start gap-2'>
          <HelpCircle className='w-4 h-4' />
          Help
        </Button>
        <Button variant='ghost' size='sm' className='w-full justify-start gap-2'>
          <MessageSquare className='w-4 h-4' />
          Feedback
        </Button>
        <Button variant='ghost' size='sm' className='w-full justify-start gap-2'>
          <Trash2 className='w-4 h-4' />
          Trash
        </Button>
      </div>
    </div>
  )
}

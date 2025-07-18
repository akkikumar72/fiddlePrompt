"use client"

import { Button } from "@v1/ui/button"
import { Badge } from "@v1/ui/badge"
import { Separator } from "@v1/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@v1/ui/popover"
import { ModelConfiguration } from "@v1/ui/model-configuration"
import { Play, Square, Share2, Settings, Zap, Brain, ChevronDown } from "lucide-react"
import { useState } from "react"

interface TopToolbarProps {
  isRunning: boolean
  onRun: () => void
  onStop: () => void
}

interface ModelConfig {
  model: string
  temperature: number
  maxLength: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  responseFormat: "text" | "json"
  streaming: boolean
}

export function TopToolbar({ isRunning, onRun, onStop }: TopToolbarProps) {
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    model: "gpt-4",
    temperature: 0.7,
    maxLength: 1024,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    responseFormat: "text",
    streaming: true
  })
  const [isModelConfigOpen, setIsModelConfigOpen] = useState(false)

  const handleModelChange = (model: string) => {
    setSelectedModel(model)
  }

  const handleConfigChange = (config: ModelConfig) => {
    setModelConfig(config)
  }

  const getModelDisplayName = (model: string) => {
    const modelNames: Record<string, string> = {
      "gpt-4": "GPT-4",
      "gpt-4-turbo": "GPT-4 Turbo",
      "gpt-3.5-turbo": "GPT-3.5 Turbo",
      "gpt-4o": "GPT-4o",
      "gpt-4o-mini": "GPT-4o Mini"
    }
    return modelNames[model] || model
  }

  return (
    <div className='h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex items-center justify-between h-full px-4'>
        <div className='flex items-center gap-4'>
          {/* Logo/Brand */}
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-primary rounded-md flex items-center justify-center'>
              <Zap className='w-4 h-4 text-primary-foreground' />
            </div>
            <span className='font-semibold text-lg'>FiddlePrompt</span>
            <Badge variant='secondary' className='text-xs'>
              BETA
            </Badge>
          </div>

          <Separator orientation='vertical' className='h-6' />

          {/* Model Configuration */}
          <div className='flex items-center gap-2'>
            <Brain className='w-4 h-4 text-muted-foreground' />
            <Popover open={isModelConfigOpen} onOpenChange={setIsModelConfigOpen}>
              <PopoverTrigger asChild>
                <Button variant='outline' className='w-[180px] justify-between' size='sm'>
                  <span className='truncate'>{getModelDisplayName(selectedModel)}</span>
                  <ChevronDown className='w-4 h-4 ml-2 shrink-0' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-80 p-0' side='bottom' align='start'>
                <ModelConfiguration onModelChange={handleModelChange} onConfigChange={handleConfigChange} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Configuration Summary */}
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <span>T: {modelConfig.temperature}</span>
            <span>•</span>
            <span>L: {modelConfig.maxLength}</span>
            <span>•</span>
            <span>{modelConfig.responseFormat.toUpperCase()}</span>
            {modelConfig.streaming && (
              <>
                <span>•</span>
                <span>Stream</span>
              </>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {/* Run/Stop Controls */}
          {isRunning ? (
            <Button onClick={onStop} variant='destructive' size='sm' className='gap-2'>
              <Square className='w-4 h-4' />
              Stop
            </Button>
          ) : (
            <Button onClick={onRun} size='sm' className='gap-2'>
              <Play className='w-4 h-4' />
              Run
            </Button>
          )}

          <Separator orientation='vertical' className='h-6' />

          {/* Share Button */}
          <Button variant='outline' size='sm' className='gap-2'>
            <Share2 className='w-4 h-4' />
            Share
          </Button>

          {/* Settings Button */}
          <Button variant='ghost' size='sm'>
            <Settings className='w-4 h-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Icons } from "./icons"
import { Label } from "./label"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Separator } from "./separator"
import { Slider } from "./slider"
import { Switch } from "./switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

interface ModelConfigurationProps {
  onModelChange?: (model: string) => void
  onConfigChange?: (config: ModelConfig) => void
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

const DEFAULT_CONFIG: ModelConfig = {
  model: "gpt-4",
  temperature: 0.7,
  maxLength: 1024,
  topP: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  responseFormat: "text",
  streaming: true
}

const MODELS = [
  { id: "gpt-4", name: "GPT-4" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini" }
]

export function ModelConfiguration({ onModelChange, onConfigChange }: ModelConfigurationProps) {
  const [config, setConfig] = useState<ModelConfig>(DEFAULT_CONFIG)

  const updateConfig = (updates: Partial<ModelConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onConfigChange?.(newConfig)
  }

  const handleModelChange = (model: string) => {
    updateConfig({ model })
    onModelChange?.(model)
  }

  return (
    <TooltipProvider>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>Model Configuration</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Model Selection */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Model</Label>
            <Select value={config.model} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue placeholder='Select a model' />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Configuration Button with Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' className='w-full justify-between'>
                <div className='flex items-center gap-2'>
                  <Icons.Settings className='h-4 w-4' />
                  <span>Configuration</span>
                </div>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <span>T: {config.temperature}</span>
                  <span>L: {config.maxLength}</span>
                  <span>P: {config.topP}</span>
                  <Icons.ChevronDown className='h-4 w-4' />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80 p-4' align='start'>
              <div className='space-y-4'>
                <h4 className='font-medium leading-none'>Configuration</h4>

                {/* Temperature */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Label className='text-sm'>Temperature</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Icons.Info className='h-4 w-4 text-muted-foreground' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Controls randomness. Higher values make output more creative, lower values more focused.</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className='ml-auto text-sm text-muted-foreground'>{config.temperature}</span>
                  </div>
                  <Slider
                    value={[config.temperature]}
                    onValueChange={([value]) => updateConfig({ temperature: value })}
                    min={0}
                    max={2}
                    step={0.1}
                    className='w-full'
                  />
                </div>

                {/* Maximum Length */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Label className='text-sm'>Maximum Length</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Icons.Info className='h-4 w-4 text-muted-foreground' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Maximum number of tokens to generate. Higher values cost more.</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className='ml-auto text-sm text-muted-foreground'>{config.maxLength}</span>
                  </div>
                  <Slider
                    value={[config.maxLength]}
                    onValueChange={([value]) => updateConfig({ maxLength: value })}
                    min={1}
                    max={4096}
                    step={256}
                    className='w-full'
                  />
                </div>

                {/* Top P */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Label className='text-sm'>Top P</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Icons.Info className='h-4 w-4 text-muted-foreground' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Controls diversity via nucleus sampling. 1.0 means no restrictions.</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className='ml-auto text-sm text-muted-foreground'>{config.topP}</span>
                  </div>
                  <Slider
                    value={[config.topP]}
                    onValueChange={([value]) => updateConfig({ topP: value })}
                    min={0}
                    max={1}
                    step={0.01}
                    className='w-full'
                  />
                </div>

                {/* Frequency Penalty */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Label className='text-sm'>Frequency Penalty</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Icons.Info className='h-4 w-4 text-muted-foreground' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Reduces repetition of tokens based on their frequency in the text.</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className='ml-auto text-sm text-muted-foreground'>{config.frequencyPenalty}</span>
                  </div>
                  <Slider
                    value={[config.frequencyPenalty]}
                    onValueChange={([value]) => updateConfig({ frequencyPenalty: value })}
                    min={-2}
                    max={2}
                    step={0.1}
                    className='w-full'
                  />
                </div>

                {/* Presence Penalty */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Label className='text-sm'>Presence Penalty</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Icons.Info className='h-4 w-4 text-muted-foreground' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Encourages new topics by penalizing tokens that already appear.</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className='ml-auto text-sm text-muted-foreground'>{config.presencePenalty}</span>
                  </div>
                  <Slider
                    value={[config.presencePenalty]}
                    onValueChange={([value]) => updateConfig({ presencePenalty: value })}
                    min={-2}
                    max={2}
                    step={0.1}
                    className='w-full'
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Response Button with Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' className='w-full justify-between'>
                <div className='flex items-center gap-2'>
                  <Icons.Description className='h-4 w-4' />
                  <span>Response</span>
                </div>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <span>{config.responseFormat === "text" ? "Text" : "JSON"}</span>
                  <span>{config.streaming ? "Streaming" : "Static"}</span>
                  <Icons.ChevronDown className='h-4 w-4' />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80 p-4' align='start'>
              <div className='space-y-4'>
                <h4 className='font-medium leading-none'>Response</h4>

                {/* Response Format */}
                <div className='space-y-2'>
                  <Label className='text-sm'>Format</Label>
                  <Select
                    value={config.responseFormat}
                    onValueChange={(value: "text" | "json") => updateConfig({ responseFormat: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='text'>Text</SelectItem>
                      <SelectItem value='json'>JSON Object</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Streaming Toggle */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Label className='text-sm'>Streaming</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Icons.Info className='h-4 w-4 text-muted-foreground' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enable real-time response streaming for faster feedback.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Switch checked={config.streaming} onCheckedChange={streaming => updateConfig({ streaming })} />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

"use client";

import { Button } from "@v1/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@v1/ui/select";
import { Badge } from "@v1/ui/badge";
import { Separator } from "@v1/ui/separator";
import { Play, Square, Share2, Settings, Zap, Brain } from "lucide-react";

interface TopToolbarProps {
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
}

export function TopToolbar({ isRunning, onRun, onStop }: TopToolbarProps) {
  return (
    <div className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">FiddlePrompt</span>
            <Badge variant="secondary" className="text-xs">
              BETA
            </Badge>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Model Selection */}
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-muted-foreground" />
            <Select defaultValue="gpt-4">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Run/Stop Controls */}
          {isRunning ? (
            <Button
              onClick={onStop}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
          ) : (
            <Button onClick={onRun} size="sm" className="gap-2">
              <Play className="w-4 h-4" />
              Run
            </Button>
          )}

          <Separator orientation="vertical" className="h-6" />

          {/* Share Button */}
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>

          {/* Settings Button */}
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

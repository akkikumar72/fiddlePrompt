"use client";

import { useState } from "react";
import { Button } from "@v1/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@v1/ui/card";
import { ScrollArea } from "@v1/ui/scroll-area";
import { Badge } from "@v1/ui/badge";
import { Separator } from "@v1/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@v1/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  TestTube,
  Clock,
  Copy,
  Trash2,
  BarChart3,
  CheckCircle,
  XCircle,
  Timer,
} from "lucide-react";

interface RightPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function RightPanel({ isCollapsed, onToggle }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState("results");

  const mockResults = [
    {
      id: 1,
      timestamp: "2:34 PM",
      tokens: 245,
      latency: "1.2s",
      status: "success",
      output:
        "Hello John! I'd be happy to help you with creating a blog post about AI automation. Here are some key points to consider...",
    },
    {
      id: 2,
      timestamp: "2:31 PM",
      tokens: 189,
      latency: "0.9s",
      status: "success",
      output:
        "I'll help you write compelling email subject lines for your product launch campaign. Here are some effective options...",
    },
  ];

  const testCases = [
    {
      id: 1,
      name: "Blog Writer",
      variables: { name: "John", task: "write blog post" },
    },
    {
      id: 2,
      name: "Email Helper",
      variables: { name: "Sarah", task: "create email campaign" },
    },
  ];

  if (isCollapsed) {
    return (
      <div className="h-full bg-muted/50 flex flex-col">
        <div className="p-3 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center gap-2 p-2">
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <TestTube className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <BarChart3 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-muted/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-muted-foreground tracking-wide uppercase">
            Test & Evaluate
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-6 h-6 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="px-4 pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
          </TabsList>
        </div>

        {/* Results Tab */}
        <TabsContent value="results" className="flex-1 px-4 mt-4">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {mockResults.length > 0 ? (
                mockResults.map((result) => (
                  <Card key={result.id} className="p-3">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result.status === "success" ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">
                            Run #{result.id}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 w-6 h-6"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {result.timestamp}
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {result.latency}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {result.tokens} tokens
                        </Badge>
                      </div>

                      {/* Output */}
                      <div className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                        {result.output}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No results yet</p>
                  <p className="text-xs">Run your prompt to see results here</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Test Cases Tab */}
        <TabsContent value="tests" className="flex-1 px-4 mt-4">
          <div className="space-y-4">
            {/* Add Test Case Button */}
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Test Case
            </Button>

            {/* Test Cases List */}
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {testCases.map((testCase) => (
                  <Card key={testCase.id} className="p-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TestTube className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">
                            {testCase.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 w-6 h-6"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {Object.entries(testCase.variables).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span className="text-muted-foreground font-mono">
                                {key}:
                              </span>
                              <span className="text-foreground">{value}</span>
                            </div>
                          )
                        )}
                      </div>

                      <Button size="sm" variant="outline" className="w-full">
                        Run Test
                      </Button>
                    </div>
                  </Card>
                ))}

                {testCases.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <TestTube className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No test cases</p>
                    <p className="text-xs">
                      Add test cases to evaluate your prompts
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

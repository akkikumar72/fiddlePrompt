"use client";

import { useState, useRef, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import { Button } from "@v1/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@v1/ui/card";
import { Badge } from "@v1/ui/badge";
import { Separator } from "@v1/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@v1/ui/tabs";
import { ChevronDown, ChevronUp, Variable, Type, Hash } from "lucide-react";

export function MainEditor() {
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant."
  );
  const [userPrompt, setUserPrompt] = useState(
    "Hello {{ name }}, can you help me with {{ task }}?"
  );
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);
  const [isVariablePanelExpanded, setIsVariablePanelExpanded] = useState(true);

  const systemEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );
  const userEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );

  // Extract variables from Jinja2 templates
  useEffect(() => {
    const extractVariables = (text: string): string[] => {
      const variableRegex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
      const matches = [...text.matchAll(variableRegex)];
      return [
        ...new Set(
          matches
            .map((match) => match[1])
            .filter((v): v is string => v !== undefined)
        ),
      ];
    };

    const systemVars = extractVariables(systemPrompt);
    const userVars = extractVariables(userPrompt);
    const allVars = [...new Set([...systemVars, ...userVars])];

    setDetectedVariables(allVars);
  }, [systemPrompt, userPrompt]);

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: typeof import("monaco-editor")
  ) => {
    // Register Jinja2 language
    monaco.languages.register({ id: "jinja2" });

    // Define Jinja2 syntax highlighting
    monaco.languages.setMonarchTokensProvider("jinja2", {
      tokenizer: {
        root: [
          [/\{\{.*?\}\}/, "variable"],
          [/\{%.*?%\}/, "tag"],
          [/\{#.*?#\}/, "comment"],
          [/[a-zA-Z_]\w*/, "identifier"],
          [/"([^"\\]|\\.)*$/, "string.invalid"],
          [/"/, "string", "@string_double"],
          [/'/, "string", "@string_single"],
          [/\d+/, "number"],
        ],
        string_double: [
          [/[^\\"]+/, "string"],
          [/\\./, "string.escape"],
          [/"/, "string", "@pop"],
        ],
        string_single: [
          [/[^\\']+/, "string"],
          [/\\./, "string.escape"],
          [/'/, "string", "@pop"],
        ],
      },
    });

    // Define theme colors for Jinja2
    monaco.editor.defineTheme("jinja2-theme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "variable", foreground: "ff6b9d", fontStyle: "bold" },
        { token: "tag", foreground: "4ecdc4" },
        { token: "comment", foreground: "6c7b7f", fontStyle: "italic" },
        { token: "string", foreground: "a8e6cf" },
        { token: "number", foreground: "ffd93d" },
      ],
      colors: {},
    });

    monaco.editor.setTheme("jinja2-theme");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Editor Sections */}
      <div className="flex-1 grid grid-rows-2 gap-0">
        {/* System Prompt Section */}
        <Card className="rounded-none border-x-0 border-t-0 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Type className="w-4 h-4" />
              System:
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 h-full pb-2">
            <div className="h-[200px]">
              <Editor
                height="100%"
                language="jinja2"
                value={systemPrompt}
                onChange={(value) => setSystemPrompt(value || "")}
                onMount={(editor, monaco) => {
                  systemEditorRef.current = editor;
                  handleEditorDidMount(editor, monaco);
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily:
                    'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontLigatures: true,
                  lineNumbers: "on",
                  folding: false,
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: true,
                  placeholder:
                    "Enter your system prompt with Jinja2 variables...",
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Prompt Section */}
        <Card className="rounded-none border-x-0 border-b-0 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Hash className="w-4 h-4" />
              User:
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 h-full pb-2">
            <div className="h-[200px]">
              <Editor
                height="100%"
                language="jinja2"
                value={userPrompt}
                onChange={(value) => setUserPrompt(value || "")}
                onMount={(editor, monaco) => {
                  userEditorRef.current = editor;
                  handleEditorDidMount(editor, monaco);
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily:
                    'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontLigatures: true,
                  lineNumbers: "on",
                  folding: false,
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: true,
                  placeholder:
                    "Enter your user prompt with Jinja2 variables...",
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Variables Panel */}
      <div className="border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVariablePanelExpanded(!isVariablePanelExpanded)}
          className="w-full justify-between p-3 h-auto"
        >
          <div className="flex items-center gap-2">
            <Variable className="w-4 h-4" />
            <span className="text-sm font-medium">Variables</span>
            <Badge variant="secondary" className="text-xs">
              {detectedVariables.length}
            </Badge>
          </div>
          {isVariablePanelExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {isVariablePanelExpanded && (
          <div className="p-4 border-t border-border bg-muted/20">
            {detectedVariables.length > 0 ? (
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground">
                  Detected Variables ({detectedVariables.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {detectedVariables.map((variable) => (
                    <div key={variable} className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        {variable}
                      </label>
                      <input
                        type="text"
                        placeholder={`Enter value for ${variable}`}
                        className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Variable className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No variables detected</p>
                <p className="text-xs">
                  Use {"{{ variable_name }}"} syntax to add variables
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

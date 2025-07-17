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
import {
  combineVariables,
  extractVariablesWithMetadata,
  type ParsedJinjaVariable,
} from "@/lib/jinja-parser";
import { VariableForm } from "../variables/variable-form";

export function MainEditor() {
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant."
  );
  const [userPrompt, setUserPrompt] = useState(
    "Hello {{ name:string[min=2,max=20] }}, can you help me with {{ task:text }}?"
  );
  const [detectedVariables, setDetectedVariables] = useState<
    ParsedJinjaVariable[]
  >([]);
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [isVariablePanelExpanded, setIsVariablePanelExpanded] = useState(true);

  const systemEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );
  const userEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );

  // Extract variables from Jinja2 templates
  useEffect(() => {
    const variables = combineVariables([systemPrompt, userPrompt]);
    setDetectedVariables(variables);
  }, [systemPrompt, userPrompt]);

  // Jinja2 error detection
  const validateJinja2Syntax = (
    text: string,
    monaco: typeof import("monaco-editor"),
    model: monaco.editor.ITextModel
  ) => {
    const markers: monaco.editor.IMarkerData[] = [];
    const lines = text.split("\n");

    lines.forEach((line, lineIndex) => {
      // Check for unmatched opening braces
      const openingBraces = (line.match(/\{\{/g) || []).length;
      const closingBraces = (line.match(/\}\}/g) || []).length;
      const openingTags = (line.match(/\{%/g) || []).length;
      const closingTags = (line.match(/%\}/g) || []).length;

      if (openingBraces !== closingBraces) {
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: lineIndex + 1,
          startColumn: 1,
          endLineNumber: lineIndex + 1,
          endColumn: line.length + 1,
          message: "Unmatched variable braces {{ }}",
        });
      }

      if (openingTags !== closingTags) {
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: lineIndex + 1,
          startColumn: 1,
          endLineNumber: lineIndex + 1,
          endColumn: line.length + 1,
          message: "Unmatched template tags {% %}",
        });
      }

      // Check for invalid variable names
      const variableMatches = [...line.matchAll(/\{\{\s*([^}]*)\s*\}\}/g)];
      variableMatches.forEach((match) => {
        const variableName = match[1]?.trim();
        if (
          variableName &&
          !/^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*(\|[a-zA-Z_][a-zA-Z0-9_]*)*$/.test(
            variableName
          )
        ) {
          const startPos = line.indexOf(match[0]);
          markers.push({
            severity: monaco.MarkerSeverity.Warning,
            startLineNumber: lineIndex + 1,
            startColumn: startPos + 1,
            endLineNumber: lineIndex + 1,
            endColumn: startPos + match[0].length + 1,
            message: `Invalid variable name: ${variableName}`,
          });
        }
      });

      // Check for empty variables
      if (line.includes("{{}}") || line.includes("{{ }}")) {
        const startPos = line.indexOf("{{");
        markers.push({
          severity: monaco.MarkerSeverity.Warning,
          startLineNumber: lineIndex + 1,
          startColumn: startPos + 1,
          endLineNumber: lineIndex + 1,
          endColumn: startPos + 4,
          message: "Empty variable declaration",
        });
      }
    });

    monaco.editor.setModelMarkers(model, "jinja2", markers);
  };

  // Handle variable form submission
  const handleVariableValuesChange = (values: Record<string, any>) => {
    // Don't call setVariableValues here - it's causing an infinite loop
    // Instead, just store the values for use when needed (like for prompt execution)
    // This breaks the circular dependency
    console.log("Variable values updated:", values);
    // You can still use the values for other operations that don't trigger re-renders
  };

  // Add useEffect to handle variable value changes when form values change
  useEffect(() => {
    // Only update if we have detected variables and no values yet
    if (
      detectedVariables.length > 0 &&
      Object.keys(variableValues).length === 0
    ) {
      // Generate default empty values
      const defaultValues = detectedVariables.reduce((acc, variable) => {
        acc[variable.name] = variable.defaultValue || "";
        return acc;
      }, {} as Record<string, any>);

      setVariableValues(defaultValues);
    }
  }, [detectedVariables]);

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

    // Register auto-completion provider
    monaco.languages.registerCompletionItemProvider("jinja2", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: monaco.languages.CompletionItem[] = [
          // Variable suggestions
          {
            label: "{{ variable }}",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "{{ ${1:variable_name} }}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Insert a variable",
            range: range,
          },
          {
            label: "{{ variable | filter }}",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "{{ ${1:variable} | ${2:filter} }}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Insert a variable with filter",
            range: range,
          },
          // Common Jinja2 filters
          {
            label: "upper",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "upper",
            documentation: "Convert to uppercase",
            range: range,
          },
          {
            label: "lower",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "lower",
            documentation: "Convert to lowercase",
            range: range,
          },
          {
            label: "title",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "title",
            documentation: "Convert to title case",
            range: range,
          },
          {
            label: "capitalize",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "capitalize",
            documentation: "Capitalize first letter",
            range: range,
          },
          {
            label: "length",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "length",
            documentation: "Get length of string/list",
            range: range,
          },
          {
            label: "default",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "default(${1:fallback})",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Provide default value",
            range: range,
          },
          {
            label: "trim",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "trim",
            documentation: "Remove whitespace",
            range: range,
          },
          {
            label: "replace",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "replace(${1:old}, ${2:new})",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Replace text",
            range: range,
          },
          // Control structures
          {
            label: "{% if %}",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "{% if ${1:condition} %}\n\t${2:content}\n{% endif %}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "If conditional block",
            range: range,
          },
          {
            label: "{% for %}",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              "{% for ${1:item} in ${2:items} %}\n\t${3:content}\n{% endfor %}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "For loop block",
            range: range,
          },
          {
            label: "{% comment %}",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "{# ${1:comment} #}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Comment block",
            range: range,
          },
        ];

        // Add detected variables as suggestions
        detectedVariables.forEach((variable) => {
          suggestions.push({
            label: variable.name,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: variable.name,
            documentation: `Detected variable: ${variable.name}`,
            range: range,
          });
        });

        return { suggestions };
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

    // Set up error detection
    const model = editor.getModel();
    if (model) {
      // Initial validation
      validateJinja2Syntax(model.getValue(), monaco, model);

      // Validate on content changes
      model.onDidChangeContent(() => {
        validateJinja2Syntax(model.getValue(), monaco, model);
      });
    }
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
            <VariableForm
              variables={detectedVariables}
              onSubmit={handleVariableValuesChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

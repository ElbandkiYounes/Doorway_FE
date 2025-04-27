"use client"

import { useState, useEffect, useCallback } from "react"
import { useTheme } from "next-themes"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs"
import "prismjs/components/prism-java"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-python"
import "prismjs/components/prism-csharp"
import "prismjs/components/prism-go"
import "prismjs/themes/prism-tomorrow.css"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Language } from "@/lib/api-service"

interface CodeEditorProps {
  code: string;
  language: Language;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  readOnly?: boolean;
}

const getLanguageForPrism = (language: string) => {
  switch (language.toLowerCase()) {
    case "java":
      return languages.java;
    case "javascript":
    case "typescript":
      return languages.javascript;
    case "python":
      return languages.python;
    case "csharp":
      return languages.csharp;
    case "go":
      return languages.go;
    default:
      return languages.java;
  }
}

export function CodeEditor({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  readOnly = false,
}: CodeEditorProps) {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  const editorStyle = {
    fontFamily: '"Fira code", "Fira Mono", monospace',
    fontSize: 14,
    backgroundColor: isDarkMode ? "hsl(var(--muted))" : "hsl(var(--muted))",
    color: isDarkMode ? "hsl(var(--foreground))" : "hsl(var(--foreground))",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Code Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={language}
              onValueChange={onLanguageChange}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Language).map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border rounded-md overflow-hidden">
            <Editor
              value={code}
              onValueChange={readOnly ? () => {} : onCodeChange}
              highlight={code => highlight(code, getLanguageForPrism(language), language.toLowerCase())}
              padding={16}
              readOnly={readOnly}
              style={editorStyle}
              className="min-h-[300px] w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

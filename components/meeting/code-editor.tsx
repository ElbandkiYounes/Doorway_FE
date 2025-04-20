'use client';

import React, { useState, useEffect } from 'react';
import { useMeeting } from '@/lib/meeting-context';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code } from 'lucide-react';

interface CodeEditorProps {
  roomId: string;
  userId: string;
}

export function CodeEditor({ roomId, userId }: CodeEditorProps) {
  const [code, setCode] = useState<string>('// Start coding here...');
  const [language, setLanguage] = useState<string>('javascript');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { sendCodeUpdate, remoteCode } = useMeeting();
  const { theme } = useTheme(); // Access the page theme

  // Apply remote code changes when they come in
  useEffect(() => {
    if (remoteCode && !isEditing) {
      setCode(remoteCode.code);
      setLanguage(remoteCode.language);
    }
  }, [remoteCode, isEditing]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      // Only send update if user is actively editing
      // Use debounce to prevent too many updates
      sendCodeUpdate(value, language);
    }
  };

  const handleEditorFocus = () => {
    setIsEditing(true);
  };

  const handleEditorBlur = () => {
    setIsEditing(false);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    sendCodeUpdate(code, newLanguage);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-2 bg-muted/20">
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <SelectValue placeholder="Select language" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="csharp">C#</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          language={language}
          value={code}
          onChange={handleEditorChange}
          onFocus={handleEditorFocus}
          onBlur={handleEditorBlur}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
          }}
          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'} // Sync with page theme
        />
      </div>
    </div>
  );
}

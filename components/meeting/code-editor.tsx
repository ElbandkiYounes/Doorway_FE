'use client';

import React, { useState, useEffect } from 'react';
import { useMeeting } from '@/lib/meeting-context';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  roomId: string;
  userId: string;
}

export function CodeEditor({ roomId, userId }: CodeEditorProps) {
  const [code, setCode] = useState<string>('// Start coding here...');
  const [language, setLanguage] = useState<string>('javascript');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { sendCodeUpdate, remoteCode } = useMeeting();

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

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    sendCodeUpdate(code, newLanguage);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-2 bg-muted/20">
        <select 
          value={language}
          onChange={handleLanguageChange}
          className="text-xs p-1 rounded border border-border bg-background"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="csharp">C#</option>
        </select>
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
          theme="vs-dark"
        />
      </div>
    </div>
  );
}

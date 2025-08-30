import React, { useRef, useEffect, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { initMonacoThemes } from '../utils/monacoThemes';
import { FileState, CompilationState } from '../App';
import { Badge } from "@/components/ui/badge";

interface CodeEditorProps {
  fileState: FileState;
  onContentUpdate: (content: string) => void;
  registerEditorMethods: (getter: () => string, setter: (content: string) => void) => void;
  compilationState: CompilationState;
  onCompileRequest: (code: string, depth?: number, scale?: number, center?: [number, number, number]) => Promise<void>;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  fileState,
  onContentUpdate,
  registerEditorMethods,
  compilationState,
  onCompileRequest,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);

  const debouncedCompile = useCallback((code: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      onCompileRequest(code);
    }, 750); // 750ms debounce
  }, [onCompileRequest]);

  // Register editor methods with parent - stable function
  useEffect(() => {
    if (monacoEditorRef.current) {
      const getContent = () => monacoEditorRef.current?.getValue() || '';
      const setContent = (content: string) => {
        if (monacoEditorRef.current) {
          monacoEditorRef.current.setValue(content);
        }
      };
      
      registerEditorMethods(getContent, setContent);
    }
  }, []); // Empty dependency - register once

  // Handle content updates from parent - stable function
  useEffect(() => {
    if (monacoEditorRef.current && fileState.content !== monacoEditorRef.current.getValue()) {
      monacoEditorRef.current.setValue(fileState.content);
    }
  }, [fileState.content]); // Only depend on content

  // FIXED: Main editor setup with empty dependency array
  useEffect(() => {
    if (!editorRef.current) return;

    // Register Rhai language (do this once)
    if (!monaco.languages.getLanguages().find(lang => lang.id === 'rhai')) {
      monaco.languages.register({ id: 'rhai' });

      // Define Rhai language syntax
      monaco.languages.setMonarchTokensProvider('rhai', {
        tokenizer: {
          root: [
            [/\b(let|const|fn|if|else|for|while|loop|break|continue|return|true|false|null)\b/, 'keyword'],
            [/\b(int|float|bool|char|string|array|map)\b/, 'type'],
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
            [/\d+/, 'number'],
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/"/, 'string', '@string'],
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/'/, 'string', '@string_single'],
            [/\/\/.*$/, 'comment'],
            [/\/\*/, 'comment', '@comment'],
            [/[+\-*/%=<>!&|^~]/, 'operator'],
            [/[{}()\[\]]/, 'delimiter.bracket'],
            [/[;,.]/, 'delimiter'],
            [/[a-zA-Z_]\w*/, 'identifier'],
          ],
          string: [
            [/[^\\"]+/, 'string'],
            [/\\./, 'string.escape'],
            [/"/, 'string', '@pop']
          ],
          string_single: [
            [/[^\\']+/, 'string'],
            [/\\./, 'string.escape'],
            [/'/, 'string', '@pop']
          ],
          comment: [
            [/[^\/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[\/*]/, 'comment']
          ],
        },
      });

      monaco.languages.setLanguageConfiguration('rhai', {
        comments: {
          lineComment: '//',
          blockComment: ['/*', '*/']
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
        ],
      });

      // Add basic completion provider for Rhai
      monaco.languages.registerCompletionItemProvider('rhai', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };

          const suggestions: monaco.languages.CompletionItem[] = [
            {
              label: 'fn',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'fn ${1:function_name}(${2:params}) {\n\t${3:// function body}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Function declaration',
              range: range
            },
            {
              label: 'let',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'let ${1:variable} = ${2:value};',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Variable declaration',
              range: range
            },
            {
              label: 'draw',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'draw(${1:shape});',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Draw function - renders a shape to 3D mesh',
              range: range
            }
          ];

          return { suggestions };
        }
      });
    }

    initMonacoThemes();

    // Create the editor
    monacoEditorRef.current = monaco.editor.create(editorRef.current, {
      value: fileState.content,
      language: 'rhai',
      theme: 'github-dark-default',
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      folding: true,
      matchBrackets: 'always',
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
    });

    // Add change listener for debounced compilation and file state updates
    const changeListener = monacoEditorRef.current.onDidChangeModelContent(() => {
      const code = monacoEditorRef.current?.getValue() || '';
      
      // Update file state with new content
      onContentUpdate(code);
      
      // Trigger compilation
      debouncedCompile(code);
    });

    // Focus the editor
    monacoEditorRef.current.focus();

    // Trigger initial compilation
    const initialCode = monacoEditorRef.current.getValue();
    debouncedCompile(initialCode);

    // Cleanup
    return () => {
      changeListener.dispose();
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
      }
    };
  }, []); // FIXED: Empty dependency array prevents infinite loop

  return (
    <div className="h-full w-full">
      <div className="h-10 bg-card border-b border-border flex items-center px-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-foreground">
            {fileState.currentFilePath 
              ? fileState.currentFilePath.split('/').pop()?.replace('.horsi', '') || 'Untitled'
              : 'Untitled'
            }
            {fileState.isModified && <span className="text-yellow-500">*</span>}
          </span>
          <Badge variant="secondary" className="text-xs">
            {fileState.currentFilePath ? '.horsi' : 'unsaved'}
          </Badge>
        </div>
        
        {/* File Status */}
        <div className="ml-4 flex items-center space-x-2">
          {fileState.isLoading && (
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1" />
              Loading
            </Badge>
          )}
        </div>
        
        {/* Compilation Status */}
        <div className="ml-auto flex items-center space-x-2">
          {compilationState.isCompiling && (
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-1" />
              Compiling
            </Badge>
          )}
          
          {compilationState.error && (
            <Badge variant="destructive" className="text-xs" title={compilationState.error}>
              <div className="w-2 h-2 bg-white rounded-full mr-1" />
              Error
            </Badge>
          )}
          
          {!compilationState.isCompiling && !compilationState.error && compilationState.lastCompiled > 0 && (
            <Badge variant="outline" className="text-xs border-green-500 text-green-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              Ready
            </Badge>
          )}
        </div>
      </div>
      <div ref={editorRef} className="h-[calc(100%-2.5rem)] w-full" />
    </div>
  );
};

export default CodeEditor;

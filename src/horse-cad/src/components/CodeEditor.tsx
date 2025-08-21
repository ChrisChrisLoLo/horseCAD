import React, { useRef, useEffect, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { useMesh } from '../contexts/MeshContext';
import { useFile } from '../contexts/FileContext';

const CodeEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);
  const { compileScript, compilationState } = useMesh();
  const fileContext = useFile();

  // FIXED: Stable debounced compilation function with proper dependencies
  const debouncedCompile = useCallback((code: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      compileScript(code);
    }, 750); // 750ms debounce
  }, [compileScript]); // Only depend on compileScript

  // Register editor methods with FileContext - stable function
  useEffect(() => {
    if (monacoEditorRef.current && (fileContext as any).registerEditorMethods) {
      const getContent = () => monacoEditorRef.current?.getValue() || '';
      const setContent = (content: string) => {
        if (monacoEditorRef.current) {
          monacoEditorRef.current.setValue(content);
        }
      };
      
      (fileContext as any).registerEditorMethods(getContent, setContent);
    }
  }, []); // Empty dependency - register once

  // Handle content updates from FileContext - stable function
  useEffect(() => {
    if (monacoEditorRef.current && fileContext.fileState.content !== monacoEditorRef.current.getValue()) {
      monacoEditorRef.current.setValue(fileContext.fileState.content);
    }
  }, [fileContext.fileState.content]); // Only depend on content

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

    // Create the editor
    monacoEditorRef.current = monaco.editor.create(editorRef.current, {
      value: fileContext.fileState.content,
      language: 'rhai',
      theme: 'vs-dark',
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
      
      // Update file context with new content
      fileContext.updateContent(code);
      
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
      <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300 font-medium">
            {fileContext.fileState.currentFilePath 
              ? fileContext.fileState.currentFilePath.split('/').pop()?.replace('.horsi', '') || 'Untitled'
              : 'Untitled'
            }
            {fileContext.fileState.isModified && <span className="text-yellow-400">*</span>}
          </span>
          <span className="text-xs text-gray-500">
            {fileContext.fileState.currentFilePath ? '.horsi' : '(unsaved)'}
          </span>
        </div>
        
        {/* File Status */}
        <div className="ml-4 flex items-center space-x-2">
          {fileContext.fileState.isLoading && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-xs text-blue-400">Loading...</span>
            </div>
          )}
        </div>
        
        {/* Compilation Status */}
        <div className="ml-auto flex items-center space-x-2">
          {compilationState.isCompiling && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-xs text-yellow-400">Compiling...</span>
            </div>
          )}
          
          {compilationState.error && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span className="text-xs text-red-400" title={compilationState.error}>
                Error
              </span>
            </div>
          )}
          
          {!compilationState.isCompiling && !compilationState.error && compilationState.lastCompiled > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs text-green-400">Ready</span>
            </div>
          )}
        </div>
      </div>
      <div ref={editorRef} className="h-[calc(100%-2rem)] w-full" />
    </div>
  );
};

export default CodeEditor;

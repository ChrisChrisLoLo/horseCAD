import React, { useRef, useEffect, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { useMesh } from '../contexts/MeshContext';

const CodeEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);
  const { compileScript, compilationState } = useMesh();

  // Debounced compilation function
  const debouncedCompile = useCallback((code: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      compileScript(code);
    }, 750); // 750ms debounce
  }, [compileScript]);

  useEffect(() => {
    if (editorRef.current) {
      // Register Rhai language
      monaco.languages.register({ id: 'rhai' });

      // Define Rhai language syntax
      monaco.languages.setMonarchTokensProvider('rhai', {
        tokenizer: {
          root: [
            // Keywords
            [/\b(let|const|fn|if|else|for|while|loop|break|continue|return|true|false|null)\b/, 'keyword'],
            
            // Types
            [/\b(int|float|bool|char|string|array|map)\b/, 'type'],
            
            // Numbers
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
            [/\d+/, 'number'],
            
            // Strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/"/, 'string', '@string'],
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/'/, 'string', '@string_single'],
            
            // Comments
            [/\/\/.*$/, 'comment'],
            [/\/\*/, 'comment', '@comment'],
            
            // Operators
            [/[+\-*/%=<>!&|^~]/, 'operator'],
            
            // Delimiters
            [/[{}()\[\]]/, 'delimiter.bracket'],
            [/[;,.]/, 'delimiter'],
            
            // Identifiers
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

      // Define language configuration
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

      // Create the editor
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value: `// Welcome to HorseCAD Rhai Editor
// Create 3D shapes using fidget functions

// Create a simple sphere
let sphere = sphere(1.0);

// Draw the shape to generate a 3D mesh
draw(sphere);`,
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
              label: 'if',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'if ${1:condition} {\n\t${2:// if body}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'If statement',
              range: range
            },
            {
              label: 'for',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'for ${1:item} in ${2:iterable} {\n\t${3:// loop body}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'For loop',
              range: range
            },
            {
              label: 'while',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'while ${1:condition} {\n\t${2:// loop body}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'While loop',
              range: range
            },
            {
              label: 'print',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'print(${1:value});',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Print function',
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

      // Add change listener for debounced compilation
      const changeListener = monacoEditorRef.current.onDidChangeModelContent(() => {
        const code = monacoEditorRef.current?.getValue() || '';
        console.log('Monaco editor content changed, triggering compilation');
        debouncedCompile(code);
      });

      // Focus the editor
      monacoEditorRef.current.focus();

      // Trigger initial compilation
      const initialCode = monacoEditorRef.current.getValue();
      console.log('Initial code loaded, triggering compilation');
      debouncedCompile(initialCode);

      // Cleanup
      return () => {
        changeListener.dispose();
        if (monacoEditorRef.current) {
          monacoEditorRef.current.dispose();
        }
      };
    }
  }, [debouncedCompile]);

  return (
    <div className="h-full w-full">
      <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-3">
        <span className="text-sm text-gray-300 font-medium">Rhai Script Editor</span>
        
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

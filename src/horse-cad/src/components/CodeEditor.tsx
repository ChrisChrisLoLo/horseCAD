import React, { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';

const CodeEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

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
// Write your Rhai scripts here

fn main() {
    let message = "Hello, HorseCAD!";
    print(message);
    
    // Example: Create a simple shape
    let radius = 5.0;
    let area = 3.14159 * radius * radius;
    print("Circle area: " + area);
}

main();`,
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
            }
          ];

          return { suggestions };
        }
      });
    }

    return () => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="h-full w-full">
      <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-3">
        <span className="text-sm text-gray-300 font-medium">Rhai Script Editor</span>
      </div>
      <div ref={editorRef} className="h-[calc(100%-2rem)] w-full" />
    </div>
  );
};

export default CodeEditor;

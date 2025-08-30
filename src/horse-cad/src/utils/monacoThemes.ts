import * as monaco from 'monaco-editor';

export function initMonacoThemes() {
    monaco.editor.defineTheme("dracula", {
        base: "vs-dark",
        inherit: true,
        rules: [
            { token: "comment", foreground: "6272a4" },
            { token: "keyword", foreground: "ff79c6" },
            { token: "operator", foreground: "ff79c6" },
            { token: "string", foreground: "f1fa8c" },
            { token: "number", foreground: "bd93f9" },
            { token: "regexp", foreground: "f1fa8c" },
            { token: "type", foreground: "8be9fd" },
            { token: "class", foreground: "8be9fd" },
            { token: "function", foreground: "50fa7b" },
            { token: "variable.predefined", foreground: "50fa7b" },
            { token: "constant", foreground: "bd93f9" },
            { token: "delimiter", foreground: "f8f8f2" },
            { token: "invalid", foreground: "ff5555" },
        ],
        colors: {
            "editor.background": "#282a36",
            "editor.foreground": "#f8f8f2",
            "editor.selectionBackground": "#44475a",
            "editor.inactiveSelectionBackground": "#44475a99",
            "editor.lineHighlightBackground": "#44475a66",
            "editorCursor.foreground": "#f8f8f2",
            "editorIndentGuide.background": "#6272a433",
            "editorIndentGuide.activeBackground": "#6272a4",
            "editorLineNumber.foreground": "#6272a4",
            "editorLineNumber.activeForeground": "#f8f8f2",
            "editorBracketMatch.border": "#50fa7b",
            "editor.selectionHighlightBackground": "#44475a88",
            "editor.wordHighlightBackground": "#8be9fd22",
            "editor.wordHighlightStrongBackground": "#8be9fd44",
            "editorWhitespace.foreground": "#6272a44d",
            "editorGutter.background": "#282a36",
            "editorSuggestWidget.background": "#282a36",
            "editorSuggestWidget.border": "#44475a",
            "editorSuggestWidget.foreground": "#f8f8f2",
            "editorSuggestWidget.highlightForeground": "#ff79c6",
            "editorSuggestWidget.selectedBackground": "#44475a",
            "editorHoverWidget.background": "#282a36",
            "editorHoverWidget.border": "#44475a",
            "editorWidget.background": "#282a36",
            "editorWidget.border": "#44475a",
            "sideBar.background": "#282a36",
        },
    });

    monaco.editor.defineTheme("github-dark", {
        "base": "vs-dark",
        "inherit": true,
        "rules": [
            {
                "background": "24292e",
                "token": ""
            },
            {
                "foreground": "959da5",
                "token": "comment"
            },
            {
                "foreground": "959da5",
                "token": "punctuation.definition.comment"
            },
            {
                "foreground": "959da5",
                "token": "string.comment"
            },
            {
                "foreground": "c8e1ff",
                "token": "constant"
            },
            {
                "foreground": "c8e1ff",
                "token": "entity.name.constant"
            },
            {
                "foreground": "c8e1ff",
                "token": "variable.other.constant"
            },
            {
                "foreground": "c8e1ff",
                "token": "variable.language"
            },
            {
                "foreground": "b392f0",
                "token": "entity"
            },
            {
                "foreground": "b392f0",
                "token": "entity.name"
            },
            {
                "foreground": "f6f8fa",
                "token": "variable.parameter.function"
            },
            {
                "foreground": "7bcc72",
                "token": "entity.name.tag"
            },
            {
                "foreground": "ea4a5a",
                "token": "keyword"
            },
            {
                "foreground": "ea4a5a",
                "token": "storage"
            },
            {
                "foreground": "ea4a5a",
                "token": "storage.type"
            },
            {
                "foreground": "f6f8fa",
                "token": "storage.modifier.package"
            },
            {
                "foreground": "f6f8fa",
                "token": "storage.modifier.import"
            },
            {
                "foreground": "f6f8fa",
                "token": "storage.type.java"
            },
            {
                "foreground": "79b8ff",
                "token": "string"
            },
            {
                "foreground": "79b8ff",
                "token": "punctuation.definition.string"
            },
            {
                "foreground": "79b8ff",
                "token": "string punctuation.section.embedded source"
            },
            {
                "foreground": "c8e1ff",
                "token": "support"
            },
            {
                "foreground": "c8e1ff",
                "token": "meta.property-name"
            },
            {
                "foreground": "fb8532",
                "token": "variable"
            },
            {
                "foreground": "f6f8fa",
                "token": "variable.other"
            },
            {
                "foreground": "d73a49",
                "fontStyle": "bold italic underline",
                "token": "invalid.broken"
            },
            {
                "foreground": "d73a49",
                "fontStyle": "bold italic underline",
                "token": "invalid.deprecated"
            },
            {
                "foreground": "fafbfc",
                "background": "d73a49",
                "fontStyle": "italic underline",
                "token": "invalid.illegal"
            },
            {
                "foreground": "fafbfc",
                "background": "d73a49",
                "fontStyle": "italic underline",
                "token": "carriage-return"
            },
            {
                "foreground": "d73a49",
                "fontStyle": "bold italic underline",
                "token": "invalid.unimplemented"
            },
            {
                "foreground": "d73a49",
                "token": "message.error"
            },
            {
                "foreground": "f6f8fa",
                "token": "string source"
            },
            {
                "foreground": "c8e1ff",
                "token": "string variable"
            },
            {
                "foreground": "79b8ff",
                "token": "source.regexp"
            },
            {
                "foreground": "79b8ff",
                "token": "string.regexp"
            },
            {
                "foreground": "79b8ff",
                "token": "string.regexp.character-class"
            },
            {
                "foreground": "79b8ff",
                "token": "string.regexp constant.character.escape"
            },
            {
                "foreground": "79b8ff",
                "token": "string.regexp source.ruby.embedded"
            },
            {
                "foreground": "79b8ff",
                "token": "string.regexp string.regexp.arbitrary-repitition"
            },
            {
                "foreground": "7bcc72",
                "fontStyle": "bold",
                "token": "string.regexp constant.character.escape"
            },
            {
                "foreground": "c8e1ff",
                "token": "support.constant"
            },
            {
                "foreground": "c8e1ff",
                "token": "support.variable"
            },
            {
                "foreground": "c8e1ff",
                "token": "meta.module-reference"
            },
            {
                "foreground": "fb8532",
                "token": "markup.list"
            },
            {
                "foreground": "0366d6",
                "fontStyle": "bold",
                "token": "markup.heading"
            },
            {
                "foreground": "0366d6",
                "fontStyle": "bold",
                "token": "markup.heading entity.name"
            },
            {
                "foreground": "c8e1ff",
                "token": "markup.quote"
            },
            {
                "foreground": "f6f8fa",
                "fontStyle": "italic",
                "token": "markup.italic"
            },
            {
                "foreground": "f6f8fa",
                "fontStyle": "bold",
                "token": "markup.bold"
            },
            {
                "foreground": "c8e1ff",
                "token": "markup.raw"
            },
            {
                "foreground": "b31d28",
                "background": "ffeef0",
                "token": "markup.deleted"
            },
            {
                "foreground": "b31d28",
                "background": "ffeef0",
                "token": "meta.diff.header.from-file"
            },
            {
                "foreground": "b31d28",
                "background": "ffeef0",
                "token": "punctuation.definition.deleted"
            },
            {
                "foreground": "176f2c",
                "background": "f0fff4",
                "token": "markup.inserted"
            },
            {
                "foreground": "176f2c",
                "background": "f0fff4",
                "token": "meta.diff.header.to-file"
            },
            {
                "foreground": "176f2c",
                "background": "f0fff4",
                "token": "punctuation.definition.inserted"
            },
            {
                "foreground": "b08800",
                "background": "fffdef",
                "token": "markup.changed"
            },
            {
                "foreground": "b08800",
                "background": "fffdef",
                "token": "punctuation.definition.changed"
            },
            {
                "foreground": "2f363d",
                "background": "959da5",
                "token": "markup.ignored"
            },
            {
                "foreground": "2f363d",
                "background": "959da5",
                "token": "markup.untracked"
            },
            {
                "foreground": "b392f0",
                "fontStyle": "bold",
                "token": "meta.diff.range"
            },
            {
                "foreground": "c8e1ff",
                "token": "meta.diff.header"
            },
            {
                "foreground": "0366d6",
                "fontStyle": "bold",
                "token": "meta.separator"
            },
            {
                "foreground": "0366d6",
                "token": "meta.output"
            },
            {
                "foreground": "ffeef0",
                "token": "brackethighlighter.tag"
            },
            {
                "foreground": "ffeef0",
                "token": "brackethighlighter.curly"
            },
            {
                "foreground": "ffeef0",
                "token": "brackethighlighter.round"
            },
            {
                "foreground": "ffeef0",
                "token": "brackethighlighter.square"
            },
            {
                "foreground": "ffeef0",
                "token": "brackethighlighter.angle"
            },
            {
                "foreground": "ffeef0",
                "token": "brackethighlighter.quote"
            },
            {
                "foreground": "d73a49",
                "token": "brackethighlighter.unmatched"
            },
            {
                "foreground": "d73a49",
                "token": "sublimelinter.mark.error"
            },
            {
                "foreground": "fb8532",
                "token": "sublimelinter.mark.warning"
            },
            {
                "foreground": "6a737d",
                "token": "sublimelinter.gutter-mark"
            },
            {
                "foreground": "79b8ff",
                "fontStyle": "underline",
                "token": "constant.other.reference.link"
            },
            {
                "foreground": "79b8ff",
                "fontStyle": "underline",
                "token": "string.other.link"
            }
        ],
        "colors": {
            "editor.foreground": "#f6f8fa",
            "editor.background": "#24292e",
            "editor.selectionBackground": "#4c2889",
            "editor.inactiveSelectionBackground": "#444d56",
            "editor.lineHighlightBackground": "#444d56",
            "editorCursor.foreground": "#ffffff",
            "editorWhitespace.foreground": "#6a737d",
            "editorIndentGuide.background": "#6a737d",
            "editorIndentGuide.activeBackground": "#f6f8fa",
            "editor.selectionHighlightBorder": "#444d56"
        }
    });

    monaco.editor.defineTheme("github-dark-default", {
        "base": "vs-dark",
        "inherit": true,
        "rules": [
            {
                "token": "invalid.broken",
                "foreground": "FFA198",
                "fontStyle": "italic"
            },
            {
                "token": "invalid.deprecated",
                "foreground": "FFA198",
                "fontStyle": "italic"
            },
            {
                "token": "invalid.illegal",
                "foreground": "FFA198",
                "fontStyle": "italic"
            },
            {
                "token": "invalid.unimplemented",
                "foreground": "FFA198",
                "fontStyle": "italic"
            },
            {
                "token": "carriage-return",
                "foreground": "F0F6FC",
                "fontStyle": "italic underline"
            },
            {
                "token": "string.regexp constant.character.escape",
                "foreground": "7EE787",
                "fontStyle": "bold"
            },
            {
                "token": "markup.heading entity.name",
                "foreground": "79C0FF",
                "fontStyle": "bold"
            },
            {
                "token": "markup.italic",
                "foreground": "E6EDF3",
                "fontStyle": "italic"
            },
            {
                "token": "markup.bold",
                "foreground": "E6EDF3",
                "fontStyle": "bold"
            },
            {
                "token": "meta.diff.range",
                "foreground": "D2A8FF",
                "fontStyle": "bold"
            },
            {
                "token": "meta.separator",
                "foreground": "79C0FF",
                "fontStyle": "bold"
            }
        ],
        "colors": {
            "activityBar.activeBorder": "#f78166",
            "activityBar.background": "#0d1117",
            "activityBar.border": "#30363d",
            "activityBar.foreground": "#e6edf3",
            "activityBar.inactiveForeground": "#7d8590",
            "activityBarBadge.background": "#1f6feb",
            "activityBarBadge.foreground": "#ffffff",
            "badge.background": "#1f6feb",
            "badge.foreground": "#ffffff",
            "breadcrumb.activeSelectionForeground": "#7d8590",
            "breadcrumb.focusForeground": "#e6edf3",
            "breadcrumb.foreground": "#7d8590",
            "breadcrumbPicker.background": "#161b22",
            "button.background": "#238636",
            "button.foreground": "#ffffff",
            "button.hoverBackground": "#2ea043",
            "button.secondaryBackground": "#282e33",
            "button.secondaryForeground": "#c9d1d9",
            "button.secondaryHoverBackground": "#30363d",
            "checkbox.background": "#161b22",
            "checkbox.border": "#30363d",
            "debugConsole.errorForeground": "#ffa198",
            "debugConsole.infoForeground": "#8b949e",
            "debugConsole.sourceForeground": "#e3b341",
            "debugConsole.warningForeground": "#d29922",
            "debugConsoleInputIcon.foreground": "#bc8cff",
            "debugIcon.breakpointForeground": "#f85149",
            "debugTokenExpression.boolean": "#56d364",
            "debugTokenExpression.error": "#ffa198",
            "debugTokenExpression.name": "#79c0ff",
            "debugTokenExpression.number": "#56d364",
            "debugTokenExpression.string": "#a5d6ff",
            "debugTokenExpression.value": "#a5d6ff",
            "debugToolBar.background": "#161b22",
            "descriptionForeground": "#7d8590",
            "diffEditor.insertedLineBackground": "#23863626",
            "diffEditor.insertedTextBackground": "#3fb9504d",
            "diffEditor.removedLineBackground": "#da363326",
            "diffEditor.removedTextBackground": "#ff7b724d",
            "dropdown.background": "#161b22",
            "dropdown.border": "#30363d",
            "dropdown.foreground": "#e6edf3",
            "dropdown.listBackground": "#161b22",
            "editor.background": "#0d1117",
            "editor.findMatchBackground": "#9e6a03",
            "editor.findMatchHighlightBackground": "#f2cc6080",
            "editor.focusedStackFrameHighlightBackground": "#2ea04366",
            "editor.foldBackground": "#6e76811a",
            "editor.foreground": "#e6edf3",
            "editor.lineHighlightBackground": "#6e76811a",
            "editor.linkedEditingBackground": "#2f81f712",
            "editor.selectionHighlightBackground": "#3fb95040",
            "editor.stackFrameHighlightBackground": "#bb800966",
            "editor.wordHighlightBackground": "#6e768180",
            "editor.wordHighlightBorder": "#6e768199",
            "editor.wordHighlightStrongBackground": "#6e76814d",
            "editor.wordHighlightStrongBorder": "#6e768199",
            "editorBracketHighlight.foreground1": "#79c0ff",
            "editorBracketHighlight.foreground2": "#56d364",
            "editorBracketHighlight.foreground3": "#e3b341",
            "editorBracketHighlight.foreground4": "#ffa198",
            "editorBracketHighlight.foreground5": "#ff9bce",
            "editorBracketHighlight.foreground6": "#d2a8ff",
            "editorBracketHighlight.unexpectedBracket.foreground": "#7d8590",
            "editorBracketMatch.background": "#3fb95040",
            "editorBracketMatch.border": "#3fb95099",
            "editorCursor.foreground": "#2f81f7",
            "editorGroup.border": "#30363d",
            "editorGroupHeader.tabsBackground": "#010409",
            "editorGroupHeader.tabsBorder": "#30363d",
            "editorGutter.addedBackground": "#2ea04366",
            "editorGutter.deletedBackground": "#f8514966",
            "editorGutter.modifiedBackground": "#bb800966",
            "editorInlayHint.background": "#8b949e33",
            "editorInlayHint.foreground": "#7d8590",
            "editorInlayHint.typeBackground": "#8b949e33",
            "editorInlayHint.typeForeground": "#7d8590",
            "editorLineNumber.activeForeground": "#e6edf3",
            "editorLineNumber.foreground": "#6e7681",
            "editorOverviewRuler.border": "#010409",
            "editorWhitespace.foreground": "#484f58",
            "editorWidget.background": "#161b22",
            "errorForeground": "#f85149",
            "focusBorder": "#1f6feb",
            "foreground": "#e6edf3",
            "gitDecoration.addedResourceForeground": "#3fb950",
            "gitDecoration.conflictingResourceForeground": "#db6d28",
            "gitDecoration.deletedResourceForeground": "#f85149",
            "gitDecoration.ignoredResourceForeground": "#6e7681",
            "gitDecoration.modifiedResourceForeground": "#d29922",
            "gitDecoration.submoduleResourceForeground": "#7d8590",
            "gitDecoration.untrackedResourceForeground": "#3fb950",
            "icon.foreground": "#7d8590",
            "input.background": "#0d1117",
            "input.border": "#30363d",
            "input.foreground": "#e6edf3",
            "input.placeholderForeground": "#6e7681",
            "keybindingLabel.foreground": "#e6edf3",
            "list.activeSelectionBackground": "#6e768166",
            "list.activeSelectionForeground": "#e6edf3",
            "list.focusBackground": "#388bfd26",
            "list.focusForeground": "#e6edf3",
            "list.highlightForeground": "#2f81f7",
            "list.hoverBackground": "#6e76811a",
            "list.hoverForeground": "#e6edf3",
            "list.inactiveFocusBackground": "#388bfd26",
            "list.inactiveSelectionBackground": "#6e768166",
            "list.inactiveSelectionForeground": "#e6edf3",
            "minimapSlider.activeBackground": "#8b949e47",
            "minimapSlider.background": "#8b949e33",
            "minimapSlider.hoverBackground": "#8b949e3d",
            "notificationCenterHeader.background": "#161b22",
            "notificationCenterHeader.foreground": "#7d8590",
            "notifications.background": "#161b22",
            "notifications.border": "#30363d",
            "notifications.foreground": "#e6edf3",
            "notificationsErrorIcon.foreground": "#f85149",
            "notificationsInfoIcon.foreground": "#2f81f7",
            "notificationsWarningIcon.foreground": "#d29922",
            "panel.background": "#010409",
            "panel.border": "#30363d",
            "panelInput.border": "#30363d",
            "panelTitle.activeBorder": "#f78166",
            "panelTitle.activeForeground": "#e6edf3",
            "panelTitle.inactiveForeground": "#7d8590",
            "peekViewEditor.background": "#6e76811a",
            "peekViewEditor.matchHighlightBackground": "#bb800966",
            "peekViewResult.background": "#0d1117",
            "peekViewResult.matchHighlightBackground": "#bb800966",
            "pickerGroup.border": "#30363d",
            "pickerGroup.foreground": "#7d8590",
            "progressBar.background": "#1f6feb",
            "quickInput.background": "#161b22",
            "quickInput.foreground": "#e6edf3",
            "scrollbar.shadow": "#484f5833",
            "scrollbarSlider.activeBackground": "#8b949e47",
            "scrollbarSlider.background": "#8b949e33",
            "scrollbarSlider.hoverBackground": "#8b949e3d",
            "settings.headerForeground": "#e6edf3",
            "settings.modifiedItemIndicator": "#bb800966",
            "sideBar.background": "#010409",
            "sideBar.border": "#30363d",
            "sideBar.foreground": "#e6edf3",
            "sideBarSectionHeader.background": "#010409",
            "sideBarSectionHeader.border": "#30363d",
            "sideBarSectionHeader.foreground": "#e6edf3",
            "sideBarTitle.foreground": "#e6edf3",
            "statusBar.background": "#0d1117",
            "statusBar.border": "#30363d",
            "statusBar.debuggingBackground": "#da3633",
            "statusBar.debuggingForeground": "#ffffff",
            "statusBar.focusBorder": "#1f6feb80",
            "statusBar.foreground": "#7d8590",
            "statusBar.noFolderBackground": "#0d1117",
            "statusBarItem.activeBackground": "#e6edf31f",
            "statusBarItem.focusBorder": "#1f6feb",
            "statusBarItem.hoverBackground": "#e6edf314",
            "statusBarItem.prominentBackground": "#6e768166",
            "statusBarItem.remoteBackground": "#30363d",
            "statusBarItem.remoteForeground": "#e6edf3",
            "symbolIcon.arrayForeground": "#f0883e",
            "symbolIcon.booleanForeground": "#58a6ff",
            "symbolIcon.classForeground": "#f0883e",
            "symbolIcon.colorForeground": "#79c0ff",
            "symbolIcon.constructorForeground": "#d2a8ff",
            "symbolIcon.enumeratorForeground": "#f0883e",
            "symbolIcon.enumeratorMemberForeground": "#58a6ff",
            "symbolIcon.eventForeground": "#6e7681",
            "symbolIcon.fieldForeground": "#f0883e",
            "symbolIcon.fileForeground": "#d29922",
            "symbolIcon.folderForeground": "#d29922",
            "symbolIcon.functionForeground": "#bc8cff",
            "symbolIcon.interfaceForeground": "#f0883e",
            "symbolIcon.keyForeground": "#58a6ff",
            "symbolIcon.keywordForeground": "#ff7b72",
            "symbolIcon.methodForeground": "#bc8cff",
            "symbolIcon.moduleForeground": "#ff7b72",
            "symbolIcon.namespaceForeground": "#ff7b72",
            "symbolIcon.nullForeground": "#58a6ff",
            "symbolIcon.numberForeground": "#3fb950",
            "symbolIcon.objectForeground": "#f0883e",
            "symbolIcon.operatorForeground": "#79c0ff",
            "symbolIcon.packageForeground": "#f0883e",
            "symbolIcon.propertyForeground": "#f0883e",
            "symbolIcon.referenceForeground": "#58a6ff",
            "symbolIcon.snippetForeground": "#58a6ff",
            "symbolIcon.stringForeground": "#79c0ff",
            "symbolIcon.structForeground": "#f0883e",
            "symbolIcon.textForeground": "#79c0ff",
            "symbolIcon.typeParameterForeground": "#79c0ff",
            "symbolIcon.unitForeground": "#58a6ff",
            "symbolIcon.variableForeground": "#f0883e",
            "tab.activeBackground": "#0d1117",
            "tab.activeBorder": "#0d1117",
            "tab.activeBorderTop": "#f78166",
            "tab.activeForeground": "#e6edf3",
            "tab.border": "#30363d",
            "tab.hoverBackground": "#0d1117",
            "tab.inactiveBackground": "#010409",
            "tab.inactiveForeground": "#7d8590",
            "tab.unfocusedActiveBorder": "#0d1117",
            "tab.unfocusedActiveBorderTop": "#30363d",
            "tab.unfocusedHoverBackground": "#6e76811a",
            "terminal.ansiBlack": "#484f58",
            "terminal.ansiBlue": "#58a6ff",
            "terminal.ansiBrightBlack": "#6e7681",
            "terminal.ansiBrightBlue": "#79c0ff",
            "terminal.ansiBrightCyan": "#56d4dd",
            "terminal.ansiBrightGreen": "#56d364",
            "terminal.ansiBrightMagenta": "#d2a8ff",
            "terminal.ansiBrightRed": "#ffa198",
            "terminal.ansiBrightWhite": "#ffffff",
            "terminal.ansiBrightYellow": "#e3b341",
            "terminal.ansiCyan": "#39c5cf",
            "terminal.ansiGreen": "#3fb950",
            "terminal.ansiMagenta": "#bc8cff",
            "terminal.ansiRed": "#ff7b72",
            "terminal.ansiWhite": "#b1bac4",
            "terminal.ansiYellow": "#d29922",
            "terminal.foreground": "#e6edf3",
            "textBlockQuote.background": "#010409",
            "textBlockQuote.border": "#30363d",
            "textCodeBlock.background": "#6e768166",
            "textLink.activeForeground": "#2f81f7",
            "textLink.foreground": "#2f81f7",
            "textPreformat.background": "#6e768166",
            "textPreformat.foreground": "#7d8590",
            "textSeparator.foreground": "#21262d",
            "titleBar.activeBackground": "#0d1117",
            "titleBar.activeForeground": "#7d8590",
            "titleBar.border": "#30363d",
            "titleBar.inactiveBackground": "#010409",
            "titleBar.inactiveForeground": "#7d8590",
            "tree.indentGuidesStroke": "#21262d"
        }
    });
    monaco.editor.defineTheme("monokai",
        {
            "base": "vs-dark",
            "inherit": true,
            "rules": [
                {
                    "background": "272822",
                    "token": ""
                },
                {
                    "foreground": "75715e",
                    "token": "comment"
                },
                {
                    "foreground": "e6db74",
                    "token": "string"
                },
                {
                    "foreground": "ae81ff",
                    "token": "constant.numeric"
                },
                {
                    "foreground": "ae81ff",
                    "token": "constant.language"
                },
                {
                    "foreground": "ae81ff",
                    "token": "constant.character"
                },
                {
                    "foreground": "ae81ff",
                    "token": "constant.other"
                },
                {
                    "foreground": "f92672",
                    "token": "keyword"
                },
                {
                    "foreground": "f92672",
                    "token": "storage"
                },
                {
                    "foreground": "66d9ef",
                    "fontStyle": "italic",
                    "token": "storage.type"
                },
                {
                    "foreground": "a6e22e",
                    "fontStyle": "underline",
                    "token": "entity.name.class"
                },
                {
                    "foreground": "a6e22e",
                    "fontStyle": "italic underline",
                    "token": "entity.other.inherited-class"
                },
                {
                    "foreground": "a6e22e",
                    "token": "entity.name.function"
                },
                {
                    "foreground": "fd971f",
                    "fontStyle": "italic",
                    "token": "variable.parameter"
                },
                {
                    "foreground": "f92672",
                    "token": "entity.name.tag"
                },
                {
                    "foreground": "a6e22e",
                    "token": "entity.other.attribute-name"
                },
                {
                    "foreground": "66d9ef",
                    "token": "support.function"
                },
                {
                    "foreground": "66d9ef",
                    "token": "support.constant"
                },
                {
                    "foreground": "66d9ef",
                    "fontStyle": "italic",
                    "token": "support.type"
                },
                {
                    "foreground": "66d9ef",
                    "fontStyle": "italic",
                    "token": "support.class"
                },
                {
                    "foreground": "f8f8f0",
                    "background": "f92672",
                    "token": "invalid"
                },
                {
                    "foreground": "f8f8f0",
                    "background": "ae81ff",
                    "token": "invalid.deprecated"
                },
                {
                    "foreground": "cfcfc2",
                    "token": "meta.structure.dictionary.json string.quoted.double.json"
                },
                {
                    "foreground": "75715e",
                    "token": "meta.diff"
                },
                {
                    "foreground": "75715e",
                    "token": "meta.diff.header"
                },
                {
                    "foreground": "f92672",
                    "token": "markup.deleted"
                },
                {
                    "foreground": "a6e22e",
                    "token": "markup.inserted"
                },
                {
                    "foreground": "e6db74",
                    "token": "markup.changed"
                },
                {
                    "foreground": "ae81ffa0",
                    "token": "constant.numeric.line-number.find-in-files - match"
                },
                {
                    "foreground": "e6db74",
                    "token": "entity.name.filename.find-in-files"
                }
            ],
            "colors": {
                "editor.foreground": "#F8F8F2",
                "editor.background": "#272822",
                "editor.selectionBackground": "#49483E",
                "editor.lineHighlightBackground": "#3E3D32",
                "editorCursor.foreground": "#F8F8F0",
                "editorWhitespace.foreground": "#3B3A32",
                "editorIndentGuide.activeBackground": "#9D550FB0",
                "editor.selectionHighlightBorder": "#222218"
            }
        }
    );
}
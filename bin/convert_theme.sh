#!/usr/bin/env bash

# The purpose of this script is to convert a VSCode theme JSON file
# into a format compatible with the Monaco Editor.
# It extracts the relevant fields and restructures them accordingly.
# Requires 'jq' for JSON processing.

# You can get the VSCode themes by installing the theme extension in VSCode, setting your VSCode instance to use the theme,
# and then exporting the theme to a JSON file using the "Developer: Generate Color Theme From Current Settings"
# command in VSCode (accessible via `Command/Control + Shift + P`).

# Usage: ./convert_theme.sh vscode-theme.json output-monaco-theme.json

if [ $# -ne 2 ]; then
    echo "Usage: $0 <vscode-theme.json> <output-monaco-theme.json>"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_FILE="$2"

# Extract base type: 'vs' for light, 'vs-dark' for dark
BASE=$(jq -r '.type' "$INPUT_FILE")
if [ "$BASE" == "dark" ]; then
    BASE="vs-dark"
else
    BASE="vs"
fi

# Convert tokenColors to rules
RULES=$(jq '[.tokenColors[] | {
    token: (if type=="array" then .scope | join(".") else .scope end),
    foreground: (.settings.foreground // empty | ltrimstr("#")),
    fontStyle: (.settings.fontStyle // empty)
}]' "$INPUT_FILE")

# Extract colors
COLORS=$(jq '.colors' "$INPUT_FILE")

# Combine into Monaco theme JSON
jq -n \
    --arg base "$BASE" \
    --argjson rules "$RULES" \
    --argjson colors "$COLORS" \
    '{
        base: $base,
        inherit: true,
        rules: $rules,
        colors: $colors
    }' > "$OUTPUT_FILE"

echo "Monaco theme saved to $OUTPUT_FILE"

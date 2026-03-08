# How It Works - Quickstart

This is the shortest path to get value from the extension.

## 1. One-Time Setup

1. Open Command Palette: `Cmd+Shift+P` (`Ctrl+Shift+P` on Windows/Linux).
2. Run: `How It Works: Quick Setup (Full Configuration)`.
3. Complete the wizard:
   `AI provider`, `AI model`, `Base URL`, `Temperature`, `Max source characters`, `Explanation language`, and `API key` if needed.
   For `openai`, custom base URLs are only applied from User settings and must use `https://`.

## 2. Pick An Explanation Language

If you want a fixed output language for your docs, run `How It Works: Set Explanation Language` before explaining files.

Supported options:

- `Auto`
- `English`
- `Spanish`
- `French`
- `German`
- `Italian`
- `Portuguese`
- `Chinese`
- `Japanese`
- `Korean`

## 3. Explain A File

1. Right-click any file in Explorer.
2. Run the action currently shown by the context menu:
   `Generate and read (XX)`, `Read (XX)`, `Regenerate AI Explanation (XX)`, or `Regenerate and read (XX)`.
3. The explanation opens in a side panel.

## 4. Understand Cache Behavior

- Explanations are saved under `.vscode/ai-docs`.
- The generated cache should normally stay out of Git.
- If cache exists, opening is immediate.
- If cache does not exist, the extension generates a new explanation.
- If the cache exists in another language, the Explorer menu offers `Regenerate and read (XX)`.

## 5. Use The Right Command

- `Read AI Explanation`: Command Palette entry point.
- `Generate and read (XX)`: first-time generation from Explorer.
- `Read (XX)`: open matching cache instantly.
- `Regenerate AI Explanation`: refresh the current cached doc.
- `Regenerate and read (XX)`: refresh because the selected explanation language changed.
- `Set API Key`: required for OpenAI.

## 6. Recommended Defaults

- `temperature`: `0.2`
- `maxSourceCharacters`: `20000` (increase for large files)
- `language`: your team's standard language

## 7. Common Fixes

- `OpenAI API key is missing` -> run `Set API Key`.
- Wrong language output -> run `Set Explanation Language (XX)` and regenerate.
- No response -> verify provider/model/base URL and connectivity.
- Old version still shown in VS Code -> reinstall the newly built VSIX or update the published release.

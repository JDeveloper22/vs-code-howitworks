# How It Works

Short on time? Start with [QUICKSTART.md](./QUICKSTART.md).

`How It Works` helps you understand source files faster.
Pick a file in Explorer and the extension will generate, reuse, or regenerate a Markdown explanation, then open it in a side panel.

## What It Does

The extension currently includes all of these user-facing capabilities:

- AI explanation generation for any file inside an open workspace.
- Local caching of explanations under `.vscode/ai-docs`.
- Fast reopen of cached explanations without calling the AI again.
- Forced regeneration when the source file changed.
- Regeneration in a different output language when the cached explanation language no longer matches the selected language.
- Interactive full setup wizard from the Command Palette.
- Secure OpenAI API key storage in VS Code Secret Storage.
- Configurable provider, model, base URL, temperature, max source size, and explanation language.
- Provider support for both `openai` and `ollama`.
- Language support for `Auto`, `English`, `Spanish`, `French`, `German`, `Italian`, `Portuguese`, `Chinese`, `Japanese`, and `Korean`.

## What It Is For

Use this extension when you want to:

- Understand legacy code without reading everything line by line.
- Onboard quickly to a new module.
- Review responsibilities, flow, and risks of a file.
- Keep living per-file documentation inside your repository.

## How It Works

1. Select a file in the VS Code Explorer.
2. Run the command shown by the context menu for the current state of that file.
3. The extension checks `.vscode/ai-docs` for a cached explanation.
4. If a matching cached explanation exists, it opens instantly.
5. If there is no cache, it generates a new explanation with OpenAI or Ollama.
6. If cache exists but the selected explanation language changed, it lets you regenerate and read in the new language.
7. It saves the result as Markdown for reuse.

## First-Time Setup (5 Minutes)

1. Install the extension.
2. Open Command Palette with `Cmd+Shift+P` (`Ctrl+Shift+P` on Windows/Linux).
3. Run `How It Works: Quick Setup (Full Configuration)`.
4. Complete the wizard:
   `AI provider`, `AI model`, `Base URL`, `Temperature`, `Max source characters`, `Explanation language`, and `API key` if needed.
5. Right-click a file and run `Read AI Explanation`.

## Commands

These are the commands a normal user can trigger directly or see dynamically in the Explorer context menu.

### Core Commands

- `Read AI Explanation`: main entry point from Command Palette.
- `Quick Setup (Full Configuration)`: configures provider, model, endpoint, temperature, source size limit, explanation language, and API key workflow.
- `Set API Key`: stores the OpenAI API key securely in VS Code Secret Storage.
- `Set Explanation Language`: changes the default output language for future explanations.
- `Regenerate AI Explanation`: forces a fresh explanation and overwrites the cached Markdown.

### Dynamic Explorer Commands

The Explorer menu changes automatically depending on cache state and selected language:

- `Generate and read (XX)`: appears when the file does not have a cached explanation yet.
- `Read (XX)`: appears when the cached explanation already matches the currently selected language.
- `Regenerate AI Explanation (XX)`: appears when you want to refresh an existing cached explanation in the same language.
- `Regenerate and read (XX)`: appears when the cached explanation exists but was generated in a different language than the one currently selected.

`XX` can be `AUTO`, `EN`, `ES`, `FR`, `DE`, `IT`, `PT`, `ZH`, `JA`, or `KO`.

## How To Get The Most Value

### Recommended Workflow

1. Start with an entry-point file (for example `index.ts`, a controller, or a service).
2. Read the explanation and list open questions.
3. Repeat with related files to build context quickly.
4. If the file changed significantly, run `Regenerate AI Explanation`.

### Which Command To Use

- `Read AI Explanation`: use it from the Command Palette or when you want the extension to decide whether to read cache or generate.
- `Generate and read (XX)`: use it from Explorer for files without cached documentation.
- `Read (XX)`: use it from Explorer when a matching cached explanation already exists.
- `Regenerate AI Explanation`: use it when the source changed and you want to overwrite the cache.
- `Regenerate and read (XX)`: use it when the cache exists but the selected explanation language changed.
- `Set Explanation Language`: use it to standardize output language before generating or regenerating explanations.
- `Set API Key`: use it when OpenAI is selected and no API key is configured yet.

### Best Practices

- Use a low `temperature` (`0.1` to `0.3`) for more consistent explanations.
- Increase `maxSourceCharacters` for larger files.
- Keep `.vscode/ai-docs` out of Git unless you intentionally want to publish generated explanations.
- If you prefer local/private execution, use `ollama` with a local model.

## Configuration

You can configure all of these settings from the setup wizard or directly in VS Code settings:

- `howItWorks.ai.provider`: `openai` or `ollama`
- `howItWorks.ai.model`: model identifier
- `howItWorks.ai.baseUrl`: optional custom endpoint. For `openai`, only User-level values are applied and they must use `https://`.
- `howItWorks.ai.temperature`: from `0` to `2`
- `howItWorks.ai.maxSourceCharacters`: minimum `1000`
- `howItWorks.ai.language`: output language (`Auto`, `Spanish`, `English`, etc.)

## Supported Explanation Languages

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

## Supported Providers

### OpenAI

- Requires an API key.
- Default base URL: `https://api.openai.com/v1`.
- Custom endpoints are only honored from User settings and must use `https://`.
- Ideal when you want hosted models and do not mind external API calls.

### Ollama

- No API key required.
- Default base URL: `http://127.0.0.1:11434`.
- Ideal when you want local execution and local models.

## Where Explanations Are Stored

- Path: `.vscode/ai-docs/<relative/path>.md`
- Example: `src/services/user.ts` -> `.vscode/ai-docs/src/services/user.ts.md`
- Each generated file may include metadata such as provider, model, generation date, and language tag.

## What Opens In The Side Panel

The webview panel shows:

- The file name and relative path.
- Whether the explanation came from cache or was generated in the current run.
- The provider and model when metadata is available.
- The generated Markdown rendered as formatted HTML.

## Install From VSIX

1. Open Extensions view in VS Code.
2. Use `...` -> `Install from VSIX...`.
3. Select your `.vsix` file.

If VS Code still shows an older installed version after packaging, rebuild the VSIX from the updated manifest and reinstall that new package.

## Common Issues

- "Explanation is not generated": verify provider, model, and network connectivity.
- "OpenAI API key is missing": run `Set API Key`.
- "Wrong output language": run `Set Explanation Language (XX)` and regenerate.
- "Explorer shows a different action than expected": this is normal because the context menu changes based on cache existence and selected explanation language.
- "The version shown in VS Code is outdated": reinstall the newly packaged VSIX or publish the new extension version so the Marketplace metadata refreshes.

## Quick Summary

For immediate value:

1. Run `Quick Setup (Full Configuration)` once.
2. Right-click important files and use the Explorer action shown for that file state.
3. Use `Set Explanation Language` before generating if you need a specific output language.
4. Regenerate only when the file changed or when you want the explanation in a different language.

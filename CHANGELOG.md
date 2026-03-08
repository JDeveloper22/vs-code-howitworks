# Changelog

All notable changes to the "How It Works" extension are documented in this file.

## [0.1.0] - 2026-03-08

- Docs: Rewrote README and QUICKSTART to document the complete current feature set, setup flow, command behavior, supported languages, configuration, storage, and troubleshooting.
- Marketplace: Updated extension metadata and description so the published listing reflects the actual product scope.
- Release: Bumped the extension version to 0.1.0 to avoid presenting the extension as an initial release.

## [0.0.2] - 2026-03-08

- New: Added multi-language support for Auto, English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, and Korean.
- New: Added explanation language selection command and language-tagged command variants.
- New: Added `Regenerate AI Explanation` to force refresh cached explanations.
- New: Added `Regenerate and read (XX)` flow when a cached explanation exists but the selected output language changed.
- New: Added `Quick Setup (Full Configuration)` for end-to-end setup from Command Palette.
- Fix: Explorer context menu commands now correctly target the file clicked with right-click.
- Docs: Reworked user-facing `README.md` and added `QUICKSTART.md`.

## [0.0.1] - 2026-03-08

- Initial release.
- Feature: AI-powered code explanations.
- Feature: Local caching in `.vscode/ai-docs`.
- Providers: OpenAI and Ollama support.

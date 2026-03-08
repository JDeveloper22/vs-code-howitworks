import { ExplanationMetadata } from "../../domain/models/ExplanationDocument";
import { ExplanationSource } from "../../application/dto/ExplainFileResult";

interface HtmlTemplateInput {
  title: string;
  relativePath: string;
  bodyHtml: string;
  source: ExplanationSource;
  metadata?: ExplanationMetadata;
}

export class HtmlTemplateFactory {
  create(input: HtmlTemplateInput): string {
    const badge =
      input.source === "cache" ? "Cache local" : "Generado en esta ejecucion";
    const generatedAt = input.metadata?.generatedAt
      ? new Date(input.metadata.generatedAt).toLocaleString()
      : "No disponible";
    const provider =
      input.metadata?.providerId && input.metadata?.modelId
        ? `${input.metadata.providerId} / ${input.metadata.modelId}`
        : "No disponible";

    return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline';"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${this.escapeHtml(input.title)}</title>
    <style>
      :root {
        color-scheme: light dark;
      }

      body {
        margin: 0;
        padding: 0;
        color: var(--vscode-foreground);
        background: var(--vscode-editor-background);
        font-family: var(--vscode-font-family);
      }

      main {
        max-width: 920px;
        margin: 0 auto;
        padding: 24px;
      }

      header {
        margin-bottom: 24px;
        padding: 16px;
        border: 1px solid var(--vscode-panel-border);
        border-radius: 12px;
        background: color-mix(
          in srgb,
          var(--vscode-editor-background) 85%,
          var(--vscode-textBlockQuote-background) 15%
        );
      }

      h1 {
        margin: 0 0 8px;
        font-size: 1.5rem;
      }

      .meta {
        margin: 4px 0;
        color: var(--vscode-descriptionForeground);
        font-size: 0.95rem;
      }

      .badge {
        display: inline-block;
        margin-bottom: 12px;
        padding: 4px 10px;
        border-radius: 999px;
        background: var(--vscode-badge-background);
        color: var(--vscode-badge-foreground);
        font-size: 0.85rem;
      }

      article {
        line-height: 1.65;
      }

      pre {
        overflow-x: auto;
        padding: 16px;
        border-radius: 10px;
        background: var(--vscode-textCodeBlock-background);
      }

      code {
        font-family: var(--vscode-editor-font-family);
      }

      blockquote {
        margin-left: 0;
        padding-left: 16px;
        border-left: 4px solid var(--vscode-textLink-foreground);
        color: var(--vscode-descriptionForeground);
      }

      table {
        border-collapse: collapse;
      }

      th,
      td {
        padding: 8px 10px;
        border: 1px solid var(--vscode-panel-border);
      }

      a {
        color: var(--vscode-textLink-foreground);
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <span class="badge">${this.escapeHtml(badge)}</span>
        <h1>${this.escapeHtml(input.title)}</h1>
        <p class="meta">Archivo: ${this.escapeHtml(input.relativePath)}</p>
        <p class="meta">Proveedor: ${this.escapeHtml(provider)}</p>
        <p class="meta">Generado: ${this.escapeHtml(generatedAt)}</p>
      </header>
      <article>${input.bodyHtml}</article>
    </main>
  </body>
</html>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}

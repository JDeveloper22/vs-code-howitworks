import * as path from "path";
import * as vscode from "vscode";
import { ExplanationDocument } from "../../domain/models/ExplanationDocument";
import { FileRef } from "../../domain/models/FileRef";
import { IPathResolver } from "../../domain/ports/IPathResolver";
import { IStorageService } from "../../domain/ports/IStorageService";

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");
const METADATA_PREFIX = "<!-- howItWorks:";

export class WorkspaceStorageService implements IStorageService {
  constructor(private readonly pathResolver: IPathResolver) {}

  async getExplanation(file: FileRef): Promise<ExplanationDocument | null> {
    const explanationPath = this.pathResolver.resolveExplanationAbsolutePath(file);
    const explanationUri = vscode.Uri.file(explanationPath);

    try {
      const content = await vscode.workspace.fs.readFile(explanationUri);
      return this.deserialize(file.relativePath, decoder.decode(content));
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }

      throw error;
    }
  }

  async saveExplanation(
    file: FileRef,
    explanation: ExplanationDocument,
  ): Promise<void> {
    const explanationPath = this.pathResolver.resolveExplanationAbsolutePath(file);
    const explanationUri = vscode.Uri.file(explanationPath);
    const parentDirectoryUri = vscode.Uri.file(path.dirname(explanationPath));

    await vscode.workspace.fs.createDirectory(parentDirectoryUri);
    await vscode.workspace.fs.writeFile(
      explanationUri,
      encoder.encode(this.serialize(explanation)),
    );
  }

  private serialize(explanation: ExplanationDocument): string {
    const serializedMetadata = explanation.metadata
      ? `${METADATA_PREFIX} ${JSON.stringify(explanation.metadata)} -->\n\n`
      : "";

    return `${serializedMetadata}${explanation.markdown.trim()}\n`;
  }

  private deserialize(
    sourceRelativePath: string,
    content: string,
  ): ExplanationDocument {
    const firstLineBreak = content.indexOf("\n");
    const header =
      firstLineBreak >= 0 ? content.slice(0, firstLineBreak) : content;

    let metadataStr = "";
    if (header.startsWith(METADATA_PREFIX) && header.trimEnd().endsWith("-->")) {
      metadataStr = header.slice(METADATA_PREFIX.length).replace(/-->$/, "").trim();
    } else if (header.startsWith("<!-- ai-code-explainer:") && header.trimEnd().endsWith("-->")) {
      metadataStr = header.slice("<!-- ai-code-explainer:".length).replace(/-->$/, "").trim();
    }

    if (metadataStr) {
      try {
        return {
          sourceRelativePath,
          metadata: JSON.parse(metadataStr) as ExplanationDocument["metadata"],
          markdown: content.slice(firstLineBreak + 1).trim(),
        };
      } catch {
        return {
          sourceRelativePath,
          markdown: content.trim(),
        };
      }
    }

    return {
      sourceRelativePath,
      markdown: content.trim(),
    };
  }

  private isNotFoundError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return (
      error.name.includes("EntryNotFound") ||
      error.name.includes("FileNotFound") ||
      error.message.includes("EntryNotFound") ||
      error.message.includes("FileNotFound")
    );
  }
}

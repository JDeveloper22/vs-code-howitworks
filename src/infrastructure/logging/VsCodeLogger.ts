import * as vscode from "vscode";
import { ILogger } from "../../domain/ports/ILogger";

export class VsCodeLogger implements ILogger, vscode.Disposable {
  private readonly outputChannel = vscode.window.createOutputChannel(
    "How It Works",
  );

  info(message: string, metadata?: Record<string, unknown>): void {
    this.outputChannel.appendLine(
      `[INFO] ${message}${metadata ? ` ${JSON.stringify(metadata)}` : ""}`,
    );
  }

  error(message: string, error?: unknown): void {
    const suffix =
      error instanceof Error ? ` ${error.name}: ${error.message}` : "";
    this.outputChannel.appendLine(`[ERROR] ${message}${suffix}`);
  }

  dispose(): void {
    this.outputChannel.dispose();
  }
}

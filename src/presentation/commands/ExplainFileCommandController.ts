import * as path from "path";
import * as vscode from "vscode";
import { MissingApiKeyError } from "../../application/errors/MissingApiKeyError";
import { ExplainFileUseCase } from "../../application/use-cases/ExplainFileUseCase";
import { FileRef } from "../../domain/models/FileRef";
import { IExplanationPresenter } from "../../domain/ports/IExplanationPresenter";
import { ILogger } from "../../domain/ports/ILogger";
import { COMMAND_IDS } from "../../shared/constants/commandIds";

export class ExplainFileCommandController {
  constructor(
    private readonly explainFileUseCase: ExplainFileUseCase,
    private readonly explanationPresenter: IExplanationPresenter,
    private readonly logger: ILogger,
  ) {}

  async execute(resource?: vscode.Uri): Promise<void> {
    const targetUri = resource ?? vscode.window.activeTextEditor?.document.uri;

    if (!targetUri) {
      await vscode.window.showWarningMessage(
        vscode.l10n.t({
          message: "How It Works: Open a file first to use the AI.",
          args: [],
          comment: ["no active editor file selected"],
        }),
      );
      return;
    }

    if (targetUri.scheme !== "file") {
      await vscode.window.showWarningMessage(
        vscode.l10n.t({
          message: "How It Works: Open a file first to use the AI.",
          args: [],
          comment: ["no active editor file selected local workspace"],
        }),
      );
      return;
    }

    const file = this.toFileRef(targetUri);

    if (!file) {
      await vscode.window.showWarningMessage(
        vscode.l10n.t({
          message: "How It Works: Open a file first to use the AI.",
          args: [],
          comment: ["no active editor file selected open workspace"],
        }),
      );
      return;
    }

    try {
      const result = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "How It Works",
        },
        async () => this.explainFileUseCase.execute(file),
      );

      await this.explanationPresenter.show(result);
    } catch (error) {
      await this.handleError(error);
      this.logger.error("Failed to explain file.", error);
    }
  }

  private toFileRef(targetUri: vscode.Uri): FileRef | null {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(targetUri);

    if (!workspaceFolder) {
      return null;
    }

    const absolutePath = targetUri.fsPath;
    const relativePath = path
      .relative(workspaceFolder.uri.fsPath, absolutePath)
      .split(path.sep)
      .join("/");

    return {
      workspaceFolderPath: workspaceFolder.uri.fsPath,
      absolutePath,
      relativePath,
      fileName: path.basename(absolutePath),
    };
  }

  private async handleError(error: unknown): Promise<void> {
    if (error instanceof MissingApiKeyError) {
      const selection = await vscode.window.showErrorMessage(
        vscode.l10n.t({
          message: "How It Works: OpenAI API Key is missing. Please run the 'Set API Key' command.",
          args: [],
          comment: ["missing apikey error"],
        }),
        vscode.l10n.t({
          message: "Set API Key",
          args: [],
          comment: ["set apikey action button"],
        }),
      );

      if (selection) {
        await vscode.commands.executeCommand(COMMAND_IDS.setApiKey);
      }

      return;
    }

    const message =
      error instanceof Error ? error.message : "Unexpected extension error.";

    await vscode.window.showErrorMessage(
      `How It Works: ${message}`,
    );
  }
}

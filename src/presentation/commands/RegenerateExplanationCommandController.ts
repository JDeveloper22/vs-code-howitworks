import * as path from "path";
import * as vscode from "vscode";
import { MissingApiKeyError } from "../../application/errors/MissingApiKeyError";
import { ExplainFileUseCase } from "../../application/use-cases/ExplainFileUseCase";
import { FileRef } from "../../domain/models/FileRef";
import { IExplanationPresenter } from "../../domain/ports/IExplanationPresenter";
import { ILogger } from "../../domain/ports/ILogger";
import { COMMAND_IDS } from "../../shared/constants/commandIds";

export class RegenerateExplanationCommandController {
  constructor(
    private readonly explainFileUseCase: ExplainFileUseCase,
    private readonly explanationPresenter: IExplanationPresenter,
    private readonly logger: ILogger,
  ) {}

  async execute(resource?: vscode.Uri): Promise<void> {
    const targetUri = resource ?? vscode.window.activeTextEditor?.document.uri;

    if (!targetUri || targetUri.scheme !== "file") {
      await vscode.window.showWarningMessage(
        vscode.l10n.t({
          message: "How It Works: Open a local file first.",
          args: [],
          comment: ["no active file selected"],
        }),
      );
      return;
    }

    const file = this.toFileRef(targetUri);

    if (!file) {
      await vscode.window.showWarningMessage(
        vscode.l10n.t({
          message: "How It Works: The file must belong to an open workspace.",
          args: [],
          comment: ["file not in open workspace"],
        }),
      );
      return;
    }

    const confirm = await vscode.window.showWarningMessage(
      vscode.l10n.t({
        message: "This will overwrite the current cached explanation. Are you sure?",
        args: [],
        comment: ["confirm regenerate explanation"],
      }),
      { modal: true },
      vscode.l10n.t({
        message: "Regenerate",
        args: [],
        comment: ["regenerate button label"],
      }),
    );

    if (confirm !== vscode.l10n.t({
      message: "Regenerate",
      args: [],
      comment: ["regenerate button label"],
    })) {
      return;
    }

    try {
      const result = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "How It Works: Regenerating explanation...",
        },
        async () => this.explainFileUseCase.execute(file, true),
      );

      await this.explanationPresenter.show(result);
    } catch (error) {
      await this.handleError(error);
      this.logger.error("Failed to regenerate explanation.", error);
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

import * as vscode from "vscode";
import { ILogger } from "../../domain/ports/ILogger";
import { ISecretsService } from "../../domain/ports/ISecretsService";
import { SECRET_KEYS } from "../../shared/constants/configurationKeys";

export class SetApiKeyCommandController {
  constructor(
    private readonly secretsService: ISecretsService,
    private readonly logger: ILogger,
  ) {}

  async execute(): Promise<void> {
    const apiKey = await vscode.window.showInputBox({
      title: vscode.l10n.t({
        message: "OpenAI API Key configuration",
        args: [],
        comment: ["apikey prompt title"],
      }),
      prompt: "Introduce la API key que se usara cuando el proveedor sea OpenAI.",
      password: true,
      ignoreFocusOut: true,
      placeHolder: vscode.l10n.t({
        message: "Enter your OpenAI API secret key starts with sk-...",
        args: [],
        comment: ["apikey placeholder"],
      }),
    });

    if (apiKey === undefined) {
      return;
    }

    const normalizedApiKey = apiKey.trim();

    if (!normalizedApiKey) {
      await vscode.window.showWarningMessage(
        vscode.l10n.t({
          message: "Enter your OpenAI API secret key starts with sk-...",
          args: [],
          comment: ["apikey placeholder validation error"],
        }),
      );
      return;
    }

    await this.secretsService.storeSecret(
      SECRET_KEYS.openAiApiKey,
      normalizedApiKey,
    );

    this.logger.info("OpenAI API key stored.");
    await vscode.window.showInformationMessage(
      vscode.l10n.t({
        message: "How It Works: OpenAI API Key securely stored.",
        args: [],
        comment: ["apikey saved properly"],
      }),
    );
  }
}

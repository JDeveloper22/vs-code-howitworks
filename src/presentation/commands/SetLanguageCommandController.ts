import * as vscode from "vscode";
import { ILogger } from "../../domain/ports/ILogger";
import {
  CONFIGURATION_KEYS,
  EXTENSION_NAMESPACE,
} from "../../shared/constants/configurationKeys";

export class SetLanguageCommandController {
  constructor(private readonly logger: ILogger) {}

  async execute(): Promise<void> {
    const configuration = vscode.workspace.getConfiguration(EXTENSION_NAMESPACE);
    const currentLanguage = configuration.get<string>(
      CONFIGURATION_KEYS.aiLanguage,
      "Auto",
    );

    const languages = [
      "Auto",
      "English",
      "Spanish",
      "French",
      "German",
      "Italian",
      "Portuguese",
      "Chinese",
      "Japanese",
      "Korean",
    ];

    const currentIndicator = vscode.l10n.t({
      message: "(Current)",
      args: [],
      comment: ["set language current indicator"],
    });

    const items: vscode.QuickPickItem[] = languages.map((lang) => ({
      label: lang,
      description: lang === currentLanguage ? currentIndicator : undefined,
    }));

    const selectedItem = await vscode.window.showQuickPick(items, {
      title: vscode.l10n.t({
        message: "Select Explanation Language",
        args: [],
        comment: ["set language prompt title"],
      }),
      placeHolder: vscode.l10n.t({
        message: "Choose the language for AI explanations",
        args: [],
        comment: ["set language prompt placeholder"],
      }),
    });

    if (selectedItem) {
      await configuration.update(
        CONFIGURATION_KEYS.aiLanguage,
        selectedItem.label,
        vscode.ConfigurationTarget.Global, // Updates user settings
      );

      this.logger.info(`Explanation language set to ${selectedItem.label}.`);

      await vscode.window.showInformationMessage(
        vscode.l10n.t({
          message: "How It Works: Explanation language set to {0}.",
          args: [selectedItem.label],
          comment: ["set language success message"],
        }),
      );
    }
  }
}

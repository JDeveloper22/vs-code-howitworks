import * as vscode from "vscode";
import { ILogger } from "../../domain/ports/ILogger";
import { ISecretsService } from "../../domain/ports/ISecretsService";
import {
  CONFIGURATION_KEYS,
  EXTENSION_NAMESPACE,
  SECRET_KEYS,
} from "../../shared/constants/configurationKeys";

const LANGUAGE_OPTIONS = [
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
] as const;

const PROVIDER_OPTIONS = ["openai", "ollama"] as const;

export class SetupExtensionCommandController {
  constructor(
    private readonly secretsService: ISecretsService,
    private readonly logger: ILogger,
  ) {}

  async execute(): Promise<void> {
    const configuration = vscode.workspace.getConfiguration(EXTENSION_NAMESPACE);

    const provider = await this.selectProvider(configuration);
    if (!provider) {
      return;
    }

    await configuration.update(
      CONFIGURATION_KEYS.aiProvider,
      provider,
      vscode.ConfigurationTarget.Global,
    );

    const model = await this.askModel(configuration, provider);
    if (model === undefined) {
      return;
    }

    await configuration.update(
      CONFIGURATION_KEYS.aiModel,
      model,
      vscode.ConfigurationTarget.Global,
    );

    const baseUrl = await this.askBaseUrl(configuration, provider);
    if (baseUrl === undefined) {
      return;
    }

    await configuration.update(
      CONFIGURATION_KEYS.aiBaseUrl,
      baseUrl,
      vscode.ConfigurationTarget.Global,
    );

    const temperature = await this.askTemperature(configuration);
    if (temperature === undefined) {
      return;
    }

    await configuration.update(
      CONFIGURATION_KEYS.aiTemperature,
      temperature,
      vscode.ConfigurationTarget.Global,
    );

    const maxSourceCharacters = await this.askMaxSourceCharacters(configuration);
    if (maxSourceCharacters === undefined) {
      return;
    }

    await configuration.update(
      CONFIGURATION_KEYS.aiMaxSourceCharacters,
      maxSourceCharacters,
      vscode.ConfigurationTarget.Global,
    );

    const language = await this.selectLanguage(configuration);
    if (!language) {
      return;
    }

    await configuration.update(
      CONFIGURATION_KEYS.aiLanguage,
      language,
      vscode.ConfigurationTarget.Global,
    );

    if (provider === "openai") {
      const shouldSetApiKeyNow = await this.askIfSetApiKeyNow();
      if (shouldSetApiKeyNow === undefined) {
        return;
      }

      if (shouldSetApiKeyNow) {
        const apiKey = await this.askApiKey();
        if (apiKey === undefined) {
          return;
        }

        await this.secretsService.storeSecret(SECRET_KEYS.openAiApiKey, apiKey);
      }
    }

    this.logger.info("Interactive setup completed.");

    await vscode.window.showInformationMessage(
      vscode.l10n.t({
        message: "How It Works: Setup completed. You can now run 'Read AI Explanation'.",
        args: [],
        comment: ["setup completed message"],
      }),
    );
  }

  private async selectProvider(
    configuration: vscode.WorkspaceConfiguration,
  ): Promise<(typeof PROVIDER_OPTIONS)[number] | undefined> {
    const currentProvider = configuration.get<string>(
      CONFIGURATION_KEYS.aiProvider,
      "openai",
    );

    const selected = await vscode.window.showQuickPick(
      PROVIDER_OPTIONS.map((provider) => ({
        label: provider,
        description: provider === currentProvider ? "(Current)" : undefined,
      })),
      {
        title: vscode.l10n.t({
          message: "How It Works Setup: AI Provider",
          args: [],
          comment: ["setup provider title"],
        }),
        placeHolder: vscode.l10n.t({
          message: "Choose which provider to use for explanations",
          args: [],
          comment: ["setup provider placeholder"],
        }),
      },
    );

    if (!selected) {
      return undefined;
    }

    return selected.label as (typeof PROVIDER_OPTIONS)[number];
  }

  private async askModel(
    configuration: vscode.WorkspaceConfiguration,
    provider: (typeof PROVIDER_OPTIONS)[number],
  ): Promise<string | undefined> {
    const fallbackModel = provider === "ollama" ? "llama3.2" : "gpt-4o-mini";
    const currentModel = configuration.get<string>(
      CONFIGURATION_KEYS.aiModel,
      fallbackModel,
    );

    return vscode.window.showInputBox({
      title: vscode.l10n.t({
        message: "How It Works Setup: Model",
        args: [],
        comment: ["setup model title"],
      }),
      prompt: vscode.l10n.t({
        message: "Model ID for provider '{0}'",
        args: [provider],
        comment: ["setup model prompt"],
      }),
      value: currentModel,
      ignoreFocusOut: true,
      validateInput: (value) =>
        value.trim().length === 0
          ? vscode.l10n.t({
              message: "Model cannot be empty.",
              args: [],
              comment: ["setup model empty validation"],
            })
          : undefined,
    }).then((value) => (value === undefined ? undefined : value.trim()));
  }

  private async askBaseUrl(
    configuration: vscode.WorkspaceConfiguration,
    provider: (typeof PROVIDER_OPTIONS)[number],
  ): Promise<string | undefined> {
    const currentBaseUrl = configuration.get<string>(
      CONFIGURATION_KEYS.aiBaseUrl,
      "",
    );

    const defaultHint =
      provider === "ollama"
        ? "http://127.0.0.1:11434"
        : "https://api.openai.com/v1";

    return vscode.window.showInputBox({
      title: vscode.l10n.t({
        message: "How It Works Setup: Base URL",
        args: [],
        comment: ["setup base url title"],
      }),
      prompt: vscode.l10n.t({
        message:
          "Optional custom endpoint. Leave empty to use provider default ({0}).",
        args: [defaultHint],
        comment: ["setup base url prompt"],
      }),
      value: currentBaseUrl,
      ignoreFocusOut: true,
    }).then((value) => (value === undefined ? undefined : value.trim()));
  }

  private async askTemperature(
    configuration: vscode.WorkspaceConfiguration,
  ): Promise<number | undefined> {
    const currentTemperature = configuration.get<number>(
      CONFIGURATION_KEYS.aiTemperature,
      0.2,
    );

    const rawValue = await vscode.window.showInputBox({
      title: vscode.l10n.t({
        message: "How It Works Setup: Temperature",
        args: [],
        comment: ["setup temperature title"],
      }),
      prompt: vscode.l10n.t({
        message: "Sampling temperature (0 to 2)",
        args: [],
        comment: ["setup temperature prompt"],
      }),
      value: String(currentTemperature),
      ignoreFocusOut: true,
      validateInput: (value) => {
        const numericValue = Number(value);
        if (Number.isNaN(numericValue)) {
          return vscode.l10n.t({
            message: "Temperature must be a number.",
            args: [],
            comment: ["setup temperature numeric validation"],
          });
        }

        if (numericValue < 0 || numericValue > 2) {
          return vscode.l10n.t({
            message: "Temperature must be between 0 and 2.",
            args: [],
            comment: ["setup temperature range validation"],
          });
        }

        return undefined;
      },
    });

    if (rawValue === undefined) {
      return undefined;
    }

    return Number(rawValue);
  }

  private async askMaxSourceCharacters(
    configuration: vscode.WorkspaceConfiguration,
  ): Promise<number | undefined> {
    const currentLimit = configuration.get<number>(
      CONFIGURATION_KEYS.aiMaxSourceCharacters,
      20000,
    );

    const rawValue = await vscode.window.showInputBox({
      title: vscode.l10n.t({
        message: "How It Works Setup: Max Source Characters",
        args: [],
        comment: ["setup max source title"],
      }),
      prompt: vscode.l10n.t({
        message: "Maximum source characters sent to AI (min 1000)",
        args: [],
        comment: ["setup max source prompt"],
      }),
      value: String(currentLimit),
      ignoreFocusOut: true,
      validateInput: (value) => {
        const numericValue = Number(value);

        if (!Number.isInteger(numericValue)) {
          return vscode.l10n.t({
            message: "Max source characters must be an integer.",
            args: [],
            comment: ["setup max source integer validation"],
          });
        }

        if (numericValue < 1000) {
          return vscode.l10n.t({
            message: "Max source characters must be 1000 or higher.",
            args: [],
            comment: ["setup max source range validation"],
          });
        }

        return undefined;
      },
    });

    if (rawValue === undefined) {
      return undefined;
    }

    return Number(rawValue);
  }

  private async selectLanguage(
    configuration: vscode.WorkspaceConfiguration,
  ): Promise<(typeof LANGUAGE_OPTIONS)[number] | undefined> {
    const currentLanguage = configuration.get<string>(
      CONFIGURATION_KEYS.aiLanguage,
      "Auto",
    );

    const selected = await vscode.window.showQuickPick(
      LANGUAGE_OPTIONS.map((language) => ({
        label: language,
        description: language === currentLanguage ? "(Current)" : undefined,
      })),
      {
        title: vscode.l10n.t({
          message: "How It Works Setup: Explanation Language",
          args: [],
          comment: ["setup language title"],
        }),
        placeHolder: vscode.l10n.t({
          message: "Choose the language used in generated explanations",
          args: [],
          comment: ["setup language placeholder"],
        }),
      },
    );

    if (!selected) {
      return undefined;
    }

    return selected.label as (typeof LANGUAGE_OPTIONS)[number];
  }

  private async askIfSetApiKeyNow(): Promise<boolean | undefined> {
    const selected = await vscode.window.showQuickPick(
      [
        {
          label: vscode.l10n.t({
            message: "Yes, set/update API key now",
            args: [],
            comment: ["setup set api key now yes"],
          }),
          value: true,
        },
        {
          label: vscode.l10n.t({
            message: "Skip for now",
            args: [],
            comment: ["setup set api key now no"],
          }),
          value: false,
        },
      ],
      {
        title: vscode.l10n.t({
          message: "How It Works Setup: OpenAI API Key",
          args: [],
          comment: ["setup api key title"],
        }),
        placeHolder: vscode.l10n.t({
          message: "Do you want to configure your OpenAI API key now?",
          args: [],
          comment: ["setup api key placeholder"],
        }),
      },
    );

    return selected?.value;
  }

  private async askApiKey(): Promise<string | undefined> {
    const apiKey = await vscode.window.showInputBox({
      title: vscode.l10n.t({
        message: "OpenAI API Key configuration",
        args: [],
        comment: ["apikey prompt title setup"],
      }),
      prompt: vscode.l10n.t({
        message: "Enter your OpenAI API key. It will be stored in VS Code Secret Storage.",
        args: [],
        comment: ["setup api key prompt"],
      }),
      placeHolder: vscode.l10n.t({
        message: "Enter your OpenAI API secret key starts with sk-...",
        args: [],
        comment: ["setup api key placeholder"],
      }),
      password: true,
      ignoreFocusOut: true,
      validateInput: (value) =>
        value.trim().length === 0
          ? vscode.l10n.t({
              message: "API key cannot be empty.",
              args: [],
              comment: ["setup api key empty validation"],
            })
          : undefined,
    });

    if (apiKey === undefined) {
      return undefined;
    }

    return apiKey.trim();
  }
}

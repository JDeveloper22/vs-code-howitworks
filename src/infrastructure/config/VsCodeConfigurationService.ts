import * as vscode from "vscode";
import { AiProviderId, AiSettings } from "../../domain/models/AiSettings";
import { IConfigurationService } from "../../domain/ports/IConfigurationService";
import {
  CONFIGURATION_KEYS,
  EXTENSION_NAMESPACE,
} from "../../shared/constants/configurationKeys";
import { resolveConfiguredBaseUrl } from "./resolveConfiguredBaseUrl";

const VALID_PROVIDERS = new Set<AiProviderId>(["openai", "ollama"]);

export class VsCodeConfigurationService implements IConfigurationService {
  getAiSettings(): AiSettings {
    const configuration = vscode.workspace.getConfiguration(EXTENSION_NAMESPACE);
    const providerCandidate = configuration.get<string>(
      CONFIGURATION_KEYS.aiProvider,
      "openai",
    );

    const provider = VALID_PROVIDERS.has(providerCandidate as AiProviderId)
      ? (providerCandidate as AiProviderId)
      : "openai";
    const configuredBaseUrl = configuration.get<string>(
      CONFIGURATION_KEYS.aiBaseUrl,
    );
    const inspectedBaseUrl = configuration.inspect<string>(
      CONFIGURATION_KEYS.aiBaseUrl,
    );

    return {
      provider,
      model: configuration.get<string>(
        CONFIGURATION_KEYS.aiModel,
        "gpt-4o-mini",
      ),
      baseUrl: resolveConfiguredBaseUrl(
        provider,
        configuredBaseUrl,
        inspectedBaseUrl,
      ),
      temperature: configuration.get<number>(
        CONFIGURATION_KEYS.aiTemperature,
        0.2,
      ),
      maxSourceCharacters: configuration.get<number>(
        CONFIGURATION_KEYS.aiMaxSourceCharacters,
        20000,
      ),
      language: configuration.get<string>(
        CONFIGURATION_KEYS.aiLanguage,
        "Auto",
      ),
    };
  }
}

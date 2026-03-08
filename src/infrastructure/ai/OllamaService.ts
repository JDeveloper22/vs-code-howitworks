import { IConfigurationService } from "../../domain/ports/IConfigurationService";
import {
  GenerateExplanationInput,
  GenerateExplanationOutput,
  IAiService,
} from "../../domain/ports/IAiService";
import { PromptBuilder } from "./PromptBuilder";

interface OllamaGenerateResponse {
  response?: string;
  error?: string;
}

function toLanguageTag(language: string | undefined): string {
  switch ((language ?? "Auto").toLowerCase()) {
    case "english":
      return "EN";
    case "spanish":
      return "ES";
    case "french":
      return "FR";
    case "german":
      return "DE";
    case "italian":
      return "IT";
    case "portuguese":
      return "PT";
    case "chinese":
      return "ZH";
    case "japanese":
      return "JA";
    case "korean":
      return "KO";
    default:
      return "AUTO";
  }
}

export class OllamaService implements IAiService {
  constructor(
    private readonly configurationService: IConfigurationService,
    private readonly promptBuilder: PromptBuilder,
  ) {}

  async generateExplanation(
    input: GenerateExplanationInput,
  ): Promise<GenerateExplanationOutput> {
    const settings = this.configurationService.getAiSettings();
    const prompt = this.promptBuilder.build(
      input,
      settings.maxSourceCharacters,
      settings.language,
    );
    const endpoint = `${this.normalizeBaseUrl(settings.baseUrl, "http://127.0.0.1:11434")}/api/generate`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: settings.model,
        prompt: prompt.userPrompt,
        system: prompt.systemPrompt,
        stream: false,
        options: {
          temperature: settings.temperature,
        },
      }),
      signal: AbortSignal.timeout(90_000),
    });

    const payload = (await response.json()) as OllamaGenerateResponse;

    if (!response.ok) {
      throw new Error(
        payload.error ?? `Ollama request failed with status ${response.status}.`,
      );
    }

    const markdown = payload.response?.trim();

    if (!markdown) {
      throw new Error("Ollama returned an empty explanation.");
    }

    return {
      markdown,
      providerId: "ollama",
      modelId: settings.model,
      languageTag: toLanguageTag(settings.language),
    };
  }

  private normalizeBaseUrl(baseUrl: string | undefined, fallback: string): string {
    const candidate = (baseUrl ?? fallback).trim();
    return candidate.replace(/\/+$/, "");
  }
}

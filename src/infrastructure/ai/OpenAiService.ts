import { MissingApiKeyError } from "../../application/errors/MissingApiKeyError";
import { IConfigurationService } from "../../domain/ports/IConfigurationService";
import {
  GenerateExplanationInput,
  GenerateExplanationOutput,
  IAiService,
} from "../../domain/ports/IAiService";
import { ISecretsService } from "../../domain/ports/ISecretsService";
import { PromptBuilder } from "./PromptBuilder";
import { SECRET_KEYS } from "../../shared/constants/configurationKeys";
import { buildOpenAiChatCompletionsEndpoint } from "./buildOpenAiChatCompletionsEndpoint";

interface OpenAiResponseContentPart {
  text?: string;
}

interface OpenAiChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | OpenAiResponseContentPart[];
    };
  }>;
  error?: {
    message?: string;
  };
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

export class OpenAiService implements IAiService {
  constructor(
    private readonly configurationService: IConfigurationService,
    private readonly secretsService: ISecretsService,
    private readonly promptBuilder: PromptBuilder,
  ) {}

  async generateExplanation(
    input: GenerateExplanationInput,
  ): Promise<GenerateExplanationOutput> {
    const settings = this.configurationService.getAiSettings();
    const apiKey = await this.secretsService.getSecret(SECRET_KEYS.openAiApiKey);

    if (!apiKey) {
      throw new MissingApiKeyError(
        "No OpenAI API key was found. Run 'How It Works: Configurar API Key'.",
      );
    }

    const prompt = this.promptBuilder.build(
      input,
      settings.maxSourceCharacters,
      settings.language,
    );
    const endpoint = buildOpenAiChatCompletionsEndpoint(settings.baseUrl);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        temperature: settings.temperature,
        messages: [
          {
            role: "system",
            content: prompt.systemPrompt,
          },
          {
            role: "user",
            content: prompt.userPrompt,
          },
        ],
      }),
      signal: AbortSignal.timeout(90_000),
    });

    const payload = (await response.json()) as OpenAiChatCompletionResponse;

    if (!response.ok) {
      throw new Error(
        payload.error?.message ??
          `OpenAI request failed with status ${response.status}.`,
      );
    }

    const content = this.extractContent(payload);

    if (!content) {
      throw new Error("OpenAI returned an empty explanation.");
    }

    return {
      markdown: content,
      providerId: "openai",
      modelId: settings.model,
      languageTag: toLanguageTag(settings.language),
    };
  }

  private extractContent(payload: OpenAiChatCompletionResponse): string {
    const content = payload.choices?.[0]?.message?.content;

    if (typeof content === "string") {
      return content.trim();
    }

    if (Array.isArray(content)) {
      return content
        .map((part) => part.text ?? "")
        .join("\n")
        .trim();
    }

    return "";
  }
}

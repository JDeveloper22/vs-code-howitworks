export const EXTENSION_NAMESPACE = "howItWorks";

export const CONFIGURATION_KEYS = {
  aiProvider: "ai.provider",
  aiModel: "ai.model",
  aiBaseUrl: "ai.baseUrl",
  aiTemperature: "ai.temperature",
  aiMaxSourceCharacters: "ai.maxSourceCharacters",
  aiLanguage: "ai.language",
} as const;

export const SECRET_KEYS = {
  openAiApiKey: "howItWorks.openAiApiKey",
} as const;

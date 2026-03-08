export type AiProviderId = "openai" | "ollama";

export interface AiSettings {
  provider: AiProviderId;
  model: string;
  baseUrl?: string;
  temperature: number;
  maxSourceCharacters: number;
  language: string;
}

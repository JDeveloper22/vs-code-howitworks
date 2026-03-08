export class UnsupportedAiProviderError extends Error {
  constructor(provider: string) {
    super(`Unsupported AI provider: ${provider}`);
    this.name = "UnsupportedAiProviderError";
  }
}

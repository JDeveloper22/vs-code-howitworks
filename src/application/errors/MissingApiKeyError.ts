export class MissingApiKeyError extends Error {
  constructor(message = "OpenAI API key is not configured.") {
    super(message);
    this.name = "MissingApiKeyError";
  }
}

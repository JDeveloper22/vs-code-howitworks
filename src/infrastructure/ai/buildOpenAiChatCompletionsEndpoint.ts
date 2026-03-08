const OPENAI_DEFAULT_BASE_URL = "https://api.openai.com/v1";

export function buildOpenAiChatCompletionsEndpoint(
  baseUrl: string | undefined,
): string {
  const normalizedBaseUrl = (baseUrl ?? OPENAI_DEFAULT_BASE_URL)
    .trim()
    .replace(/\/+$/, "");

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(normalizedBaseUrl);
  } catch {
    throw new Error("OpenAI base URL is invalid.");
  }

  if (parsedUrl.protocol !== "https:") {
    throw new Error("OpenAI base URL must use HTTPS.");
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error("OpenAI base URL must not include embedded credentials.");
  }

  return `${normalizedBaseUrl}/chat/completions`;
}
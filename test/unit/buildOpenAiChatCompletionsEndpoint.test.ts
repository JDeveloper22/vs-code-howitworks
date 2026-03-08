import assert from "node:assert/strict";
import test from "node:test";
import { buildOpenAiChatCompletionsEndpoint } from "../../src/infrastructure/ai/buildOpenAiChatCompletionsEndpoint";

test("buildOpenAiChatCompletionsEndpoint uses the default OpenAI endpoint", () => {
  assert.equal(
    buildOpenAiChatCompletionsEndpoint(undefined),
    "https://api.openai.com/v1/chat/completions",
  );
});

test("buildOpenAiChatCompletionsEndpoint rejects insecure protocols", () => {
  assert.throws(
    () => buildOpenAiChatCompletionsEndpoint("http://example.com/v1"),
    /must use HTTPS/i,
  );
});

test("buildOpenAiChatCompletionsEndpoint rejects embedded credentials", () => {
  assert.throws(
    () => buildOpenAiChatCompletionsEndpoint("https://user:pass@example.com/v1"),
    /must not include embedded credentials/i,
  );
});
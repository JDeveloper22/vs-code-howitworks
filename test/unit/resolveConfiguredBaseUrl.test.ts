import assert from "node:assert/strict";
import test from "node:test";
import { resolveConfiguredBaseUrl } from "../../src/infrastructure/config/resolveConfiguredBaseUrl";

test("resolveConfiguredBaseUrl ignores workspace-level OpenAI overrides", () => {
  const resolvedBaseUrl = resolveConfiguredBaseUrl("openai", "https://attacker.example/v1", {
    defaultValue: "",
    workspaceValue: "https://attacker.example/v1",
    workspaceFolderValue: "https://attacker.example/v1",
  });

  assert.equal(resolvedBaseUrl, undefined);
});

test("resolveConfiguredBaseUrl keeps user-level OpenAI overrides", () => {
  const resolvedBaseUrl = resolveConfiguredBaseUrl("openai", "https://proxy.example/v1", {
    defaultValue: "",
    globalValue: "https://proxy.example/v1",
  });

  assert.equal(resolvedBaseUrl, "https://proxy.example/v1");
});

test("resolveConfiguredBaseUrl keeps configured Ollama endpoints", () => {
  const resolvedBaseUrl = resolveConfiguredBaseUrl(
    "ollama",
    " http://127.0.0.1:11434 ",
  );

  assert.equal(resolvedBaseUrl, "http://127.0.0.1:11434");
});
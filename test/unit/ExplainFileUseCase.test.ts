import assert from "node:assert/strict";
import test from "node:test";
import { ExplainFileUseCase } from "../../src/application/use-cases/ExplainFileUseCase";
import { ExplanationDocument } from "../../src/domain/models/ExplanationDocument";
import { FileRef } from "../../src/domain/models/FileRef";
import {
  GenerateExplanationInput,
  GenerateExplanationOutput,
  IAiService,
} from "../../src/domain/ports/IAiService";
import { ILogger } from "../../src/domain/ports/ILogger";
import { ISourceFileService } from "../../src/domain/ports/ISourceFileService";
import { IStorageService } from "../../src/domain/ports/IStorageService";

class InMemoryStorageService implements IStorageService {
  explanation: ExplanationDocument | null = null;
  saveCalls = 0;

  async getExplanation(): Promise<ExplanationDocument | null> {
    return this.explanation;
  }

  async saveExplanation(
    _file: FileRef,
    explanation: ExplanationDocument,
  ): Promise<void> {
    this.explanation = explanation;
    this.saveCalls += 1;
  }
}

class StubSourceFileService implements ISourceFileService {
  readCalls = 0;

  async read(file: FileRef) {
    this.readCalls += 1;
    return {
      ...file,
      languageId: "typescript",
      content: "export const answer = 42;",
    };
  }
}

class StubAiService implements IAiService {
  calls = 0;

  async generateExplanation(
    _input: GenerateExplanationInput,
  ): Promise<GenerateExplanationOutput> {
    this.calls += 1;
    return {
      markdown: "# Explicacion\n\nContenido generado.",
      providerId: "openai",
      modelId: "gpt-4o-mini",
    };
  }
}

class NoopLogger implements ILogger {
  info(): void {}
  error(): void {}
}

function buildFileRef(): FileRef {
  return {
    workspaceFolderPath: "/workspace",
    absolutePath: "/workspace/src/app.ts",
    relativePath: "src/app.ts",
    fileName: "app.ts",
  };
}

test("ExplainFileUseCase returns cached explanations without calling AI", async () => {
  const storage = new InMemoryStorageService();
  const source = new StubSourceFileService();
  const ai = new StubAiService();
  const useCase = new ExplainFileUseCase(storage, source, ai, new NoopLogger());
  const cached: ExplanationDocument = {
    sourceRelativePath: "src/app.ts",
    markdown: "# Cache",
  };

  storage.explanation = cached;

  const result = await useCase.execute(buildFileRef());

  assert.equal(result.source, "cache");
  assert.equal(result.explanation.markdown, "# Cache");
  assert.equal(source.readCalls, 0);
  assert.equal(ai.calls, 0);
  assert.equal(storage.saveCalls, 0);
});

test("ExplainFileUseCase generates, saves and returns new explanations", async () => {
  const storage = new InMemoryStorageService();
  const source = new StubSourceFileService();
  const ai = new StubAiService();
  const useCase = new ExplainFileUseCase(storage, source, ai, new NoopLogger());

  const result = await useCase.execute(buildFileRef());

  assert.equal(result.source, "generated");
  assert.equal(result.explanation.markdown, "# Explicacion\n\nContenido generado.");
  assert.equal(source.readCalls, 1);
  assert.equal(ai.calls, 1);
  assert.equal(storage.saveCalls, 1);
  assert.equal(storage.explanation?.metadata?.providerId, "openai");
  assert.equal(storage.explanation?.metadata?.modelId, "gpt-4o-mini");
  assert.ok(storage.explanation?.metadata?.generatedAt);
});

test("ExplainFileUseCase ignores cache when force is true", async () => {
  const storage = new InMemoryStorageService();
  const source = new StubSourceFileService();
  const ai = new StubAiService();
  const useCase = new ExplainFileUseCase(storage, source, ai, new NoopLogger());
  const cached: ExplanationDocument = {
    sourceRelativePath: "src/app.ts",
    markdown: "# Cache Vieja",
  };

  storage.explanation = cached;

  const result = await useCase.execute(buildFileRef(), true);

  assert.equal(result.source, "generated");
  assert.equal(result.explanation.markdown, "# Explicacion\n\nContenido generado.");
  assert.equal(source.readCalls, 1);
  assert.equal(ai.calls, 1);
  assert.equal(storage.saveCalls, 1);
});

import assert from "node:assert/strict";
import test from "node:test";
import * as path from "path";
import { MirrorPathResolver } from "../../src/infrastructure/storage/MirrorPathResolver";
import { FileRef } from "../../src/domain/models/FileRef";

test("MirrorPathResolver builds the hidden mirror markdown path", () => {
  const resolver = new MirrorPathResolver();
  const file: FileRef = {
    workspaceFolderPath: "/workspace",
    absolutePath: "/workspace/src/core/service.ts",
    relativePath: "src/core/service.ts",
    fileName: "service.ts",
  };

  const resolvedPath = resolver.resolveExplanationAbsolutePath(file);

  assert.equal(
    resolvedPath,
    path.join("/workspace", ".vscode", "ai-docs", "src", "core", "service.ts") +
      ".md",
  );
});

test("MirrorPathResolver normalizes mixed directory separators", () => {
  const resolver = new MirrorPathResolver();
  const file: FileRef = {
    workspaceFolderPath: "/workspace",
    absolutePath: "/workspace/src/core/service.ts",
    relativePath: "src\\core/service.ts",
    fileName: "service.ts",
  };

  const resolvedPath = resolver.resolveExplanationAbsolutePath(file);

  assert.equal(
    resolvedPath,
    path.join("/workspace", ".vscode", "ai-docs", "src", "core", "service.ts") +
      ".md",
  );
});

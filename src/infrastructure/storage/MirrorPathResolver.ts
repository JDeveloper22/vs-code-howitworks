import * as path from "path";
import { FileRef } from "../../domain/models/FileRef";
import { IPathResolver } from "../../domain/ports/IPathResolver";

export class MirrorPathResolver implements IPathResolver {
  resolveExplanationAbsolutePath(file: FileRef): string {
    const relativeSegments = file.relativePath
      .replace(/^[/\\]+/, "")
      .split(/[\\/]+/)
      .filter(Boolean);

    return path.join(
      file.workspaceFolderPath,
      ".vscode",
      "ai-docs",
      ...relativeSegments,
    ) + ".md";
  }
}

import * as vscode from "vscode";
import { FileRef } from "../../domain/models/FileRef";
import { SourceCodeDocument } from "../../domain/models/SourceCodeDocument";
import { ISourceFileService } from "../../domain/ports/ISourceFileService";

export class VsCodeSourceFileService implements ISourceFileService {
  async read(file: FileRef): Promise<SourceCodeDocument> {
    const document = await vscode.workspace.openTextDocument(
      vscode.Uri.file(file.absolutePath),
    );

    return {
      ...file,
      languageId: document.languageId,
      content: document.getText(),
    };
  }
}

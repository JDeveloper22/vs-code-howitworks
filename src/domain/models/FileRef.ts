export interface FileRef {
  workspaceFolderPath: string;
  absolutePath: string;
  relativePath: string;
  fileName: string;
  languageId?: string;
}

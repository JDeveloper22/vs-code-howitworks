import { FileRef } from "./FileRef";

export interface SourceCodeDocument extends FileRef {
  content: string;
}

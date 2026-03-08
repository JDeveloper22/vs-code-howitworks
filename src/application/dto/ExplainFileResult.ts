import { ExplanationDocument } from "../../domain/models/ExplanationDocument";
import { FileRef } from "../../domain/models/FileRef";

export type ExplanationSource = "cache" | "generated";

export interface ExplainFileResult {
  file: FileRef;
  explanation: ExplanationDocument;
  source: ExplanationSource;
}

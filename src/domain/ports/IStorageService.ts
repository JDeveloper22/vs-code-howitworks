import { ExplanationDocument } from "../models/ExplanationDocument";
import { FileRef } from "../models/FileRef";

export interface IStorageService {
  getExplanation(file: FileRef): Promise<ExplanationDocument | null>;
  saveExplanation(file: FileRef, explanation: ExplanationDocument): Promise<void>;
}

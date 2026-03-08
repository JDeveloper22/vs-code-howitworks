import { FileRef } from "../models/FileRef";
import { SourceCodeDocument } from "../models/SourceCodeDocument";

export interface ISourceFileService {
  read(file: FileRef): Promise<SourceCodeDocument>;
}

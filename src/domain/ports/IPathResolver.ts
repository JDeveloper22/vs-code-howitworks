import { FileRef } from "../models/FileRef";

export interface IPathResolver {
  resolveExplanationAbsolutePath(file: FileRef): string;
}

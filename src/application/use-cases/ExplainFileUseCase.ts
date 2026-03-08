import { ExplainFileResult } from "../dto/ExplainFileResult";
import { ExplanationDocument } from "../../domain/models/ExplanationDocument";
import { FileRef } from "../../domain/models/FileRef";
import { IAiService } from "../../domain/ports/IAiService";
import { ILogger } from "../../domain/ports/ILogger";
import { ISourceFileService } from "../../domain/ports/ISourceFileService";
import { IStorageService } from "../../domain/ports/IStorageService";

export class ExplainFileUseCase {
  constructor(
    private readonly storageService: IStorageService,
    private readonly sourceFileService: ISourceFileService,
    private readonly aiService: IAiService,
    private readonly logger: ILogger,
  ) {}

  async execute(file: FileRef, force: boolean = false): Promise<ExplainFileResult> {
    const cachedExplanation = !force ? await this.storageService.getExplanation(file) : null;

    if (cachedExplanation) {
      this.logger.info("Explanation loaded from cache.", {
        relativePath: file.relativePath,
      });

      return {
        file,
        explanation: cachedExplanation,
        source: "cache",
      };
    }

    const sourceDocument = await this.sourceFileService.read(file);

    if (!sourceDocument.content.trim()) {
      throw new Error("The selected file is empty.");
    }

    const aiOutput = await this.aiService.generateExplanation({
      fileName: sourceDocument.fileName,
      relativePath: sourceDocument.relativePath,
      languageId: sourceDocument.languageId,
      sourceCode: sourceDocument.content,
    });

    const explanation: ExplanationDocument = {
      sourceRelativePath: sourceDocument.relativePath,
      markdown: aiOutput.markdown,
      metadata: {
        generatedAt: new Date().toISOString(),
        providerId: aiOutput.providerId,
        modelId: aiOutput.modelId,
        languageTag: aiOutput.languageTag,
      },
    };

    await this.storageService.saveExplanation(file, explanation);

    this.logger.info("Explanation generated and cached.", {
      relativePath: file.relativePath,
      providerId: aiOutput.providerId,
      modelId: aiOutput.modelId,
    });

    return {
      file,
      explanation,
      source: "generated",
    };
  }
}

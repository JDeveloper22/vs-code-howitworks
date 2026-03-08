export interface GenerateExplanationInput {
  fileName: string;
  relativePath: string;
  languageId?: string;
  sourceCode: string;
}

export interface GenerateExplanationOutput {
  markdown: string;
  providerId: string;
  modelId: string;
  languageTag?: string;
}

export interface IAiService {
  generateExplanation(
    input: GenerateExplanationInput,
  ): Promise<GenerateExplanationOutput>;
}

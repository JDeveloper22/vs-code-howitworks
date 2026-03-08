export interface ExplanationMetadata {
  generatedAt?: string;
  providerId?: string;
  modelId?: string;
  languageTag?: string;
}

export interface ExplanationDocument {
  sourceRelativePath: string;
  markdown: string;
  metadata?: ExplanationMetadata;
}

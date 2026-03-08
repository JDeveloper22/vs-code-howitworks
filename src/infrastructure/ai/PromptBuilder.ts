import { GenerateExplanationInput } from "../../domain/ports/IAiService";

export interface PromptPayload {
  systemPrompt: string;
  userPrompt: string;
}

export class PromptBuilder {
  build(
    input: GenerateExplanationInput,
    maxSourceCharacters: number,
    targetLanguage: string = "Auto",
  ): PromptPayload {
    const truncatedSourceCode = this.truncateSource(
      input.sourceCode,
      maxSourceCharacters,
    );
    
    const languageInstruction = targetLanguage.toLowerCase() === "auto" 
        ? "Responde en el mismo idioma en el que están escritos los comentarios del código o en ingles si no hay."
        : `Devuelve una explicacion tecnica en Markdown, clara y precisa, en ${targetLanguage}.`;

    return {
      systemPrompt: [
        "Eres un Arquitecto de Software Senior experto en explicar codigo fuente.",
        languageInstruction,
        "Describe responsabilidades, flujo principal, dependencias, decisiones de diseno y riesgos.",
        "No inventes comportamiento que no este respaldado por el codigo.",
      ].join(" "),
      userPrompt: [
        `Archivo: ${input.fileName}`,
        `Ruta relativa: ${input.relativePath}`,
        `Lenguaje: ${input.languageId ?? "desconocido"}`,
        "",
        "Explica este archivo con las siguientes secciones:",
        "1. Resumen",
        "2. Responsabilidades principales",
        "3. Flujo o comportamiento clave",
        "4. Dependencias y colaboraciones",
        "5. Riesgos o notas importantes",
        "",
        "Codigo fuente:",
        "```",
        truncatedSourceCode,
        "```",
      ].join("\n"),
    };
  }

  private truncateSource(sourceCode: string, maxSourceCharacters: number): string {
    if (sourceCode.length <= maxSourceCharacters) {
      return sourceCode;
    }

    return [
      sourceCode.slice(0, maxSourceCharacters),
      "",
      `/* Source truncated after ${maxSourceCharacters} characters. */`,
    ].join("\n");
  }
}

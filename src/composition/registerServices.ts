import * as vscode from "vscode";
import { ExplainFileUseCase } from "../application/use-cases/ExplainFileUseCase";
import { ConfiguredAiService } from "../infrastructure/ai/ConfiguredAiService";
import { OllamaService } from "../infrastructure/ai/OllamaService";
import { OpenAiService } from "../infrastructure/ai/OpenAiService";
import { PromptBuilder } from "../infrastructure/ai/PromptBuilder";
import { VsCodeConfigurationService } from "../infrastructure/config/VsCodeConfigurationService";
import { VsCodeSecretsService } from "../infrastructure/config/VsCodeSecretsService";
import { VsCodeLogger } from "../infrastructure/logging/VsCodeLogger";
import { VsCodeSourceFileService } from "../infrastructure/source/VsCodeSourceFileService";
import { MirrorPathResolver } from "../infrastructure/storage/MirrorPathResolver";
import { WorkspaceStorageService } from "../infrastructure/storage/WorkspaceStorageService";
import { ExplainFileCommandController } from "../presentation/commands/ExplainFileCommandController";
import { RegenerateExplanationCommandController } from "../presentation/commands/RegenerateExplanationCommandController";
import { SetApiKeyCommandController } from "../presentation/commands/SetApiKeyCommandController";
import { SetLanguageCommandController } from "../presentation/commands/SetLanguageCommandController";
import { SetupExtensionCommandController } from "../presentation/commands/SetupExtensionCommandController";
import { HtmlTemplateFactory } from "../presentation/webview/HtmlTemplateFactory";
import { MarkdownRenderer } from "../presentation/webview/MarkdownRenderer";
import { WebviewPanelPresenter } from "../presentation/webview/WebviewPanelPresenter";
import { AiProviderId } from "../domain/models/AiSettings";
import { IAiService } from "../domain/ports/IAiService";

export interface ServiceRegistration {
  controllers: {
    explainFile: ExplainFileCommandController;
    regenerateExplanation: RegenerateExplanationCommandController;
    setupExtension: SetupExtensionCommandController;
    setApiKey: SetApiKeyCommandController;
    setLanguage: SetLanguageCommandController;
  };
  disposables: vscode.Disposable[];
}

export function registerServices(
  context: vscode.ExtensionContext,
): ServiceRegistration {
  const logger = new VsCodeLogger();
  const configurationService = new VsCodeConfigurationService();
  const secretsService = new VsCodeSecretsService(context.secrets);
  const promptBuilder = new PromptBuilder();
  const pathResolver = new MirrorPathResolver();
  const storageService = new WorkspaceStorageService(pathResolver);
  const sourceFileService = new VsCodeSourceFileService();
  const openAiService = new OpenAiService(
    configurationService,
    secretsService,
    promptBuilder,
  );
  const ollamaService = new OllamaService(configurationService, promptBuilder);
  const aiProviders = new Map<AiProviderId, IAiService>([
    ["openai", openAiService],
    ["ollama", ollamaService],
  ]);
  const aiService = new ConfiguredAiService(configurationService, aiProviders);
  const explainFileUseCase = new ExplainFileUseCase(
    storageService,
    sourceFileService,
    aiService,
    logger,
  );
  const explanationPresenter = new WebviewPanelPresenter(
    new MarkdownRenderer(),
    new HtmlTemplateFactory(),
    logger,
  );

  return {
    controllers: {
      explainFile: new ExplainFileCommandController(
        explainFileUseCase,
        explanationPresenter,
        logger,
      ),
      regenerateExplanation: new RegenerateExplanationCommandController(
        explainFileUseCase,
        explanationPresenter,
        logger,
      ),
      setupExtension: new SetupExtensionCommandController(secretsService, logger),
      setApiKey: new SetApiKeyCommandController(secretsService, logger),
      setLanguage: new SetLanguageCommandController(logger),
    },
    disposables: [logger, explanationPresenter],
  };
}

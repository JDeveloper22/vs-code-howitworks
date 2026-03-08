import * as vscode from "vscode";
import * as path from "path";
import {
  COMMAND_IDS,
  GENERATE_AND_READ_COMMAND_VARIANTS,
  READ_EXPLANATION_COMMAND_VARIANTS,
  REGENERATE_AND_READ_EXPLANATION_COMMAND_VARIANTS,
  REGENERATE_EXPLANATION_COMMAND_VARIANTS,
  SET_LANGUAGE_COMMAND_VARIANTS,
} from "../../shared/constants/commandIds";
import {
  CONFIGURATION_KEYS,
  EXTENSION_NAMESPACE,
} from "../../shared/constants/configurationKeys";
import { ExplainFileCommandController } from "./ExplainFileCommandController";
import { RegenerateExplanationCommandController } from "./RegenerateExplanationCommandController";
import { SetApiKeyCommandController } from "./SetApiKeyCommandController";
import { SetLanguageCommandController } from "./SetLanguageCommandController";
import { SetupExtensionCommandController } from "./SetupExtensionCommandController";

export interface CommandControllers {
  explainFile: ExplainFileCommandController;
  regenerateExplanation: RegenerateExplanationCommandController;
  setupExtension: SetupExtensionCommandController;
  setApiKey: SetApiKeyCommandController;
  setLanguage: SetLanguageCommandController;
}

const LANGUAGE_CONTEXT_KEY = "howItWorks.languageTag";
const HAS_EXPLANATION_CONTEXT_KEY = "howItWorks.hasExplanation";
const EXPLANATION_LANGUAGE_CHANGED_CONTEXT_KEY =
  "howItWorks.explanationLanguageChanged";

const LANGUAGE_TAG_BY_SETTING: Record<string, string> = {
  Auto: "AUTO",
  English: "EN",
  Spanish: "ES",
  French: "FR",
  German: "DE",
  Italian: "IT",
  Portuguese: "PT",
  Chinese: "ZH",
  Japanese: "JA",
  Korean: "KO",
};

function getLanguageTag(language: string | undefined): string {
  return LANGUAGE_TAG_BY_SETTING[language ?? ""] ?? "AUTO";
}

async function syncLanguageCommandContext(): Promise<void> {
  const configuration = vscode.workspace.getConfiguration(EXTENSION_NAMESPACE);
  const selectedLanguage = configuration.get<string>(
    CONFIGURATION_KEYS.aiLanguage,
    "Auto",
  );

  await vscode.commands.executeCommand(
    "setContext",
    LANGUAGE_CONTEXT_KEY,
    getLanguageTag(selectedLanguage),
  );
}

function getCurrentLanguageTag(): string {
  const configuration = vscode.workspace.getConfiguration(EXTENSION_NAMESPACE);
  const selectedLanguage = configuration.get<string>(
    CONFIGURATION_KEYS.aiLanguage,
    "Auto",
  );

  return getLanguageTag(selectedLanguage);
}

function isUri(value: unknown): value is vscode.Uri {
  return value instanceof vscode.Uri;
}

function extractUri(value: unknown): vscode.Uri | undefined {
  if (isUri(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const extracted = extractUri(item);
      if (extracted) {
        return extracted;
      }
    }

    return undefined;
  }

  if (!value || typeof value !== "object") {
    return undefined;
  }

  const maybeResource = value as {
    resourceUri?: unknown;
    uri?: unknown;
    fsPath?: unknown;
  };

  if (maybeResource.resourceUri) {
    return extractUri(maybeResource.resourceUri);
  }

  if (maybeResource.uri) {
    return extractUri(maybeResource.uri);
  }

  if (typeof maybeResource.fsPath === "string") {
    return vscode.Uri.file(maybeResource.fsPath);
  }

  return undefined;
}

function resolveCommandTargetUri(args: unknown[]): vscode.Uri | undefined {
  if (args.length === 0) {
    return undefined;
  }

  for (const arg of args) {
    const extracted = extractUri(arg);
    if (extracted) {
      return extracted;
    }
  }

  return undefined;
}

function toWorkspaceFileRef(targetUri: vscode.Uri): {
  workspaceFolderPath: string;
  relativePath: string;
} | null {
  if (targetUri.scheme !== "file") {
    return null;
  }

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(targetUri);
  if (!workspaceFolder) {
    return null;
  }

  const relativePath = path
    .relative(workspaceFolder.uri.fsPath, targetUri.fsPath)
    .split(path.sep)
    .join("/");

  return {
    workspaceFolderPath: workspaceFolder.uri.fsPath,
    relativePath,
  };
}

function toExplanationUri(targetUri: vscode.Uri): vscode.Uri | null {
  const fileRef = toWorkspaceFileRef(targetUri);
  if (!fileRef) {
    return null;
  }

  const relativeSegments = fileRef.relativePath
    .replace(/^[/\\]+/, "")
    .split(/[\\/]+/)
    .filter(Boolean);

  return vscode.Uri.file(
    path.join(
      fileRef.workspaceFolderPath,
      ".vscode",
      "ai-docs",
      ...relativeSegments,
    ) + ".md",
  );
}

async function hasCachedExplanation(targetUri?: vscode.Uri): Promise<boolean> {
  if (!targetUri) {
    return false;
  }

  const explanationUri = toExplanationUri(targetUri);
  if (!explanationUri) {
    return false;
  }

  try {
    await vscode.workspace.fs.stat(explanationUri);
    return true;
  } catch {
    return false;
  }
}

async function getCachedExplanationLanguageTag(
  targetUri?: vscode.Uri,
): Promise<string | undefined> {
  if (!targetUri) {
    return undefined;
  }

  const explanationUri = toExplanationUri(targetUri);
  if (!explanationUri) {
    return undefined;
  }

  try {
    const bytes = await vscode.workspace.fs.readFile(explanationUri);
    const content = new TextDecoder("utf-8").decode(bytes);
    const firstLineBreak = content.indexOf("\n");
    const header =
      firstLineBreak >= 0 ? content.slice(0, firstLineBreak) : content;

    let metadataStr = "";
    if (header.startsWith("<!-- howItWorks:") && header.trimEnd().endsWith("-->")) {
      metadataStr = header.slice("<!-- howItWorks:".length).replace(/-->$/, "").trim();
    } else if (
      header.startsWith("<!-- ai-code-explainer:") &&
      header.trimEnd().endsWith("-->")
    ) {
      metadataStr = header
        .slice("<!-- ai-code-explainer:".length)
        .replace(/-->$/, "")
        .trim();
    }

    if (!metadataStr) {
      return undefined;
    }

    const metadata = JSON.parse(metadataStr) as { languageTag?: string };
    return metadata.languageTag?.toUpperCase();
  } catch {
    return undefined;
  }
}

async function syncHasExplanationCommandContext(
  targetUri?: vscode.Uri,
): Promise<void> {
  const hasExplanation = await hasCachedExplanation(targetUri);
  const selectedLanguageTag = getCurrentLanguageTag();
  const cachedLanguageTag = hasExplanation
    ? await getCachedExplanationLanguageTag(targetUri)
    : undefined;
  const explanationLanguageChanged =
    hasExplanation &&
    cachedLanguageTag !== undefined &&
    cachedLanguageTag !== selectedLanguageTag;

  await vscode.commands.executeCommand(
    "setContext",
    HAS_EXPLANATION_CONTEXT_KEY,
    hasExplanation,
  );
  await vscode.commands.executeCommand(
    "setContext",
    EXPLANATION_LANGUAGE_CHANGED_CONTEXT_KEY,
    explanationLanguageChanged,
  );
}

export function registerCommands(
  context: vscode.ExtensionContext,
  controllers: CommandControllers,
): void {
  void syncLanguageCommandContext();
  void syncHasExplanationCommandContext(
    vscode.window.activeTextEditor?.document.uri,
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (
        event.affectsConfiguration(
          `${EXTENSION_NAMESPACE}.${CONFIGURATION_KEYS.aiLanguage}`,
        )
      ) {
        void syncLanguageCommandContext();
        void syncHasExplanationCommandContext(
          vscode.window.activeTextEditor?.document.uri,
        );
      }
    }),
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      void syncHasExplanationCommandContext(editor?.document.uri);
    }),
  );

  context.subscriptions.push(
    ...GENERATE_AND_READ_COMMAND_VARIANTS.map((commandId) =>
      vscode.commands.registerCommand(commandId, async (...args: unknown[]) => {
        const targetUri =
          resolveCommandTargetUri(args) ??
          vscode.window.activeTextEditor?.document.uri;
        await controllers.explainFile.execute(targetUri);
        await syncHasExplanationCommandContext(targetUri);
      }),
    ),
    ...READ_EXPLANATION_COMMAND_VARIANTS.map((commandId) =>
      vscode.commands.registerCommand(commandId, async (...args: unknown[]) => {
        const targetUri =
          resolveCommandTargetUri(args) ??
          vscode.window.activeTextEditor?.document.uri;
        await controllers.explainFile.execute(targetUri);
        await syncHasExplanationCommandContext(targetUri);
      }),
    ),
    ...REGENERATE_EXPLANATION_COMMAND_VARIANTS.map((commandId) =>
      vscode.commands.registerCommand(commandId, async (...args: unknown[]) => {
        const targetUri =
          resolveCommandTargetUri(args) ??
          vscode.window.activeTextEditor?.document.uri;
        await controllers.regenerateExplanation.execute(targetUri);
        await syncHasExplanationCommandContext(targetUri);
      }),
    ),
    ...REGENERATE_AND_READ_EXPLANATION_COMMAND_VARIANTS.map((commandId) =>
      vscode.commands.registerCommand(commandId, async (...args: unknown[]) => {
        const targetUri =
          resolveCommandTargetUri(args) ??
          vscode.window.activeTextEditor?.document.uri;
        await controllers.regenerateExplanation.execute(targetUri);
        await syncHasExplanationCommandContext(targetUri);
      }),
    ),
    vscode.commands.registerCommand(COMMAND_IDS.setupExtension, async () => {
      await controllers.setupExtension.execute();
    }),
    vscode.commands.registerCommand(COMMAND_IDS.setApiKey, async () => {
      await controllers.setApiKey.execute();
    }),
    ...SET_LANGUAGE_COMMAND_VARIANTS.map((commandId) =>
      vscode.commands.registerCommand(commandId, async () => {
        await controllers.setLanguage.execute();
      }),
    ),
  );
}

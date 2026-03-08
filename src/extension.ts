import * as vscode from "vscode";
import { registerServices } from "./composition/registerServices";
import { registerCommands } from "./presentation/commands/registerCommands";

export function activate(context: vscode.ExtensionContext): void {
  const services = registerServices(context);

  context.subscriptions.push(...services.disposables);
  registerCommands(context, services.controllers);
}

export function deactivate(): void {}

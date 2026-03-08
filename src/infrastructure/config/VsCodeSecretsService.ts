import * as vscode from "vscode";
import { ISecretsService } from "../../domain/ports/ISecretsService";

export class VsCodeSecretsService implements ISecretsService {
  constructor(private readonly secretStorage: vscode.SecretStorage) {}

  async getSecret(key: string): Promise<string | undefined> {
    return this.secretStorage.get(key);
  }

  async storeSecret(key: string, value: string): Promise<void> {
    await this.secretStorage.store(key, value);
  }
}

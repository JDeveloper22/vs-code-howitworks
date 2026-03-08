import { AiProviderId } from "../../domain/models/AiSettings";

export interface ConfigValueInspection<T> {
  defaultValue?: T;
  globalValue?: T;
  workspaceValue?: T;
  workspaceFolderValue?: T;
}

function normalizeConfiguredValue(value: string | undefined): string | undefined {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : undefined;
}

export function resolveConfiguredBaseUrl(
  provider: AiProviderId,
  configuredValue: string | undefined,
  inspectedValue?: ConfigValueInspection<string>,
): string | undefined {
  if (provider !== "openai") {
    return normalizeConfiguredValue(configuredValue);
  }

  return (
    normalizeConfiguredValue(inspectedValue?.globalValue) ??
    normalizeConfiguredValue(inspectedValue?.defaultValue)
  );
}
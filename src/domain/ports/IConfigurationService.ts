import { AiSettings } from "../models/AiSettings";

export interface IConfigurationService {
  getAiSettings(): AiSettings;
}

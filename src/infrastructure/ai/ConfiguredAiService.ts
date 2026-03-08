import { UnsupportedAiProviderError } from "../../application/errors/UnsupportedAiProviderError";
import { AiProviderId } from "../../domain/models/AiSettings";
import { IConfigurationService } from "../../domain/ports/IConfigurationService";
import {
  GenerateExplanationInput,
  GenerateExplanationOutput,
  IAiService,
} from "../../domain/ports/IAiService";

export class ConfiguredAiService implements IAiService {
  constructor(
    private readonly configurationService: IConfigurationService,
    private readonly providers: ReadonlyMap<AiProviderId, IAiService>,
  ) {}

  async generateExplanation(
    input: GenerateExplanationInput,
  ): Promise<GenerateExplanationOutput> {
    const providerId = this.configurationService.getAiSettings().provider;
    const provider = this.providers.get(providerId);

    if (!provider) {
      throw new UnsupportedAiProviderError(providerId);
    }

    return provider.generateExplanation(input);
  }
}

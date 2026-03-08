import { ExplainFileResult } from "../../application/dto/ExplainFileResult";

export interface IExplanationPresenter {
  show(result: ExplainFileResult): Promise<void>;
}

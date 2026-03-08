import * as vscode from "vscode";
import { ExplainFileResult } from "../../application/dto/ExplainFileResult";
import { IExplanationPresenter } from "../../domain/ports/IExplanationPresenter";
import { ILogger } from "../../domain/ports/ILogger";
import { HtmlTemplateFactory } from "./HtmlTemplateFactory";
import { MarkdownRenderer } from "./MarkdownRenderer";

export class WebviewPanelPresenter
  implements IExplanationPresenter, vscode.Disposable
{
  private panel: vscode.WebviewPanel | undefined;
  private panelDisposeSubscription: vscode.Disposable | undefined;

  constructor(
    private readonly markdownRenderer: MarkdownRenderer,
    private readonly htmlTemplateFactory: HtmlTemplateFactory,
    private readonly logger: ILogger,
  ) {}

  async show(result: ExplainFileResult): Promise<void> {
    const title = vscode.l10n.t({
      message: "How It Works: {0}",
      args: [result.file.fileName],
      comment: ["webview panel title"],
    });

    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel(
        "howItWorks.explanation",
        title,
        {
          viewColumn: vscode.ViewColumn.Beside,
          preserveFocus: false,
        },
        {
          enableFindWidget: true,
          retainContextWhenHidden: true,
        },
      );

      this.panelDisposeSubscription = this.panel.onDidDispose(() => {
        this.panel = undefined;
        this.panelDisposeSubscription?.dispose();
        this.panelDisposeSubscription = undefined;
      });
    } else {
      this.panel.title = title;
      this.panel.reveal(vscode.ViewColumn.Beside, false);
    }

    this.panel.webview.html = this.htmlTemplateFactory.create({
      title,
      relativePath: result.file.relativePath,
      bodyHtml: this.markdownRenderer.render(result.explanation.markdown),
      source: result.source,
      metadata: result.explanation.metadata,
    });

    this.logger.info("Explanation rendered in webview.", {
      relativePath: result.file.relativePath,
      source: result.source,
    });
  }

  dispose(): void {
    this.panelDisposeSubscription?.dispose();
    this.panelDisposeSubscription = undefined;
    this.panel?.dispose();
    this.panel = undefined;
  }
}

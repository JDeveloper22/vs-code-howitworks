import MarkdownIt from "markdown-it";

export class MarkdownRenderer {
  private readonly markdownIt = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
  });

  render(markdown: string): string {
    return this.markdownIt.render(markdown);
  }
}

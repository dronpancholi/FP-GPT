import { saveAs } from 'file-saver';

export class DocumentGenerator {
  async generatePDF(content: string, title: string): Promise<void> {
    const blob = new Blob([content], { type: 'application/pdf' });
    saveAs(blob, `${title}.pdf`);
  }

  async generateMarkdown(content: string, title: string): Promise<void> {
    const markdown = `# ${title}\n\n${content}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    saveAs(blob, `${title}.md`);
  }

  async generateTXT(content: string, title: string): Promise<void> {
    const blob = new Blob([content], { type: 'text/plain' });
    saveAs(blob, `${title}.txt`);
  }

  async generateJSON(data: any, title: string): Promise<void> {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, `${title}.json`);
  }
}
import { Transformer } from './models/transformer';
import { DataManager } from './training/dataManager';

export class LocalAI {
  private transformer: Transformer;
  private dataManager: DataManager;

  constructor() {
    this.transformer = new Transformer();
    this.dataManager = new DataManager();
  }

  async train(): Promise<void> {
    const trainingData = this.dataManager.getData();
    const texts = trainingData.map(data => `${data.input} => ${data.output}`);
    await this.transformer.train(texts);
  }

  async generate(prompt: string): Promise<string> {
    return this.transformer.generate(prompt);
  }
}
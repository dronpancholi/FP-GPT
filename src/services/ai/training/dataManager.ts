import { TrainingData } from '../../../types';
import { LocalStorageService } from '../../storage/localStorage';

const storage = new LocalStorageService('training_');

export class DataManager {
  private data: TrainingData[] = [];

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    const saved = storage.get('data');
    if (saved) {
      this.data = saved;
    }
  }

  addData(input: string, output: string): void {
    const newData: TrainingData = {
      input,
      output,
      timestamp: new Date()
    };
    this.data.push(newData);
    storage.set('data', this.data);
  }

  getData(): TrainingData[] {
    return this.data;
  }

  clear(): void {
    this.data = [];
    storage.remove('data');
  }
}
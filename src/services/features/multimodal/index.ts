import { TextProcessor } from './text';
import { ImageProcessor } from './image';
import { AudioProcessor } from './audio';

export class MultiModalProcessor {
  private processors = {
    text: new TextProcessor(),
    image: new ImageProcessor(),
    audio: new AudioProcessor()
  };

  async process(input: any, type: 'text' | 'image' | 'audio') {
    return await this.processors[type].analyze(input);
  }
}
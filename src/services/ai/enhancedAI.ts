import { Transformer } from './models/transformer';
import { searchInternet } from './internetAccess';
import { DataManager } from './training/dataManager';
import { analyzePrompt } from '../utils/promptAnalyzer';

export class EnhancedAI {
  private transformer: Transformer;
  private dataManager: DataManager;
  private context: string[] = [];

  constructor() {
    this.transformer = new Transformer();
    this.dataManager = new DataManager();
  }

  async process(input: string): Promise<string> {
    try {
      // Analyze the prompt type
      const promptTypes = analyzePrompt(input);
      
      // Search the internet for relevant information
      const searchResults = await searchInternet(input);
      
      // Add search results to context
      this.context.push(searchResults);
      
      // Keep context window manageable
      if (this.context.length > 5) {
        this.context.shift();
      }
      
      // Combine context with input for better response generation
      const contextualPrompt = [
        ...this.context,
        input
      ].join('\n');
      
      // Generate response using the transformer model
      const localResponse = await this.transformer.generate(contextualPrompt);
      
      // Store interaction for future training
      this.dataManager.addData(input, localResponse);
      
      return localResponse;
    } catch (error) {
      console.error('Error in AI processing:', error);
      return "I apologize, but I'm having trouble processing that request.";
    }
  }

  async train(): Promise<void> {
    const trainingData = this.dataManager.getData();
    const texts = trainingData.map(data => `${data.input} => ${data.output}`);
    await this.transformer.train(texts);
  }
}
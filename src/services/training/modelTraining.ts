import { ModelConfig, TrainingData } from '../../types';
import { LocalStorageService } from '../storage/localStorage';

const storage = new LocalStorageService();

export class ModelTrainer {
  private config: ModelConfig;
  private trainingData: TrainingData[] = [];

  constructor(config: ModelConfig) {
    this.config = config;
    this.loadTrainingData();
  }

  private loadTrainingData(): void {
    const saved = storage.get('training_data');
    if (saved) {
      this.trainingData = saved;
    }
  }

  addTrainingData(data: TrainingData): void {
    this.trainingData.push(data);
    storage.set('training_data', this.trainingData);
  }

  async trainModel(): Promise<void> {
    // Using TensorFlow.js for browser-based training
    const tf = await import('@tensorflow/tfjs');
    
    // Create a simple sequential model
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 64, activation: 'relu', inputShape: [10] }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    // Compile the model
    model.compile({
      optimizer: tf.train.adam(this.config.learningRate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    // Convert training data to tensors
    const inputs = tf.tensor2d(this.trainingData.map(d => d.input));
    const outputs = tf.tensor2d(this.trainingData.map(d => [d.output]));

    // Train the model
    await model.fit(inputs, outputs, {
      epochs: this.config.epochs,
      batchSize: this.config.batchSize,
      validationSplit: 0.2
    });

    // Save the model to localStorage
    await model.save('localstorage://fpgpt-model');
  }

  async predict(input: number[]): Promise<number> {
    const tf = await import('@tensorflow/tfjs');
    const model = await tf.loadLayersModel('localstorage://fpgpt-model');
    const prediction = model.predict(tf.tensor2d([input])) as tf.Tensor;
    return (await prediction.data())[0];
  }
}
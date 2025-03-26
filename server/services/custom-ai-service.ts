
import * as tf from '@tensorflow/tfjs';
import { z } from 'zod';

// Define schema for training data
const trainingDataSchema = z.object({
  features: z.array(z.number()),
  label: z.string()
});

export class CustomAIService {
  private model: tf.LayersModel | null = null;
  
  async trainModel(trainingData: z.infer<typeof trainingDataSchema>[]) {
    // Create a simple neural network
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [trainingData[0].features.length], units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    // Compile the model
    this.model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    // Prepare training data
    const xs = tf.tensor2d(trainingData.map(d => d.features));
    const ys = tf.tensor2d(trainingData.map(d => [d.label === 'positive' ? 1 : 0]));

    // Train the model
    await this.model.fit(xs, ys, {
      epochs: 50,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`);
        }
      }
    });

    return this.model;
  }

  async predict(features: number[]) {
    if (!this.model) {
      throw new Error('Model not trained');
    }
    
    const prediction = await this.model.predict(tf.tensor2d([features])) as tf.Tensor;
    return prediction.dataSync()[0];
  }
}

export const customAIService = new CustomAIService();

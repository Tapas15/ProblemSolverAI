import { pipeline, env } from '@xenova/transformers';

// Set environment variables for the transformer
env.allowLocalModels = true;
env.cacheDir = './model-cache';  // Local cache for downloaded models

// Define the type for our AI response
interface AIResponse {
  text: string;
  processingTime: number;
}

/**
 * LocalAIService - Provides AI capabilities using local Transformer models
 * without requiring external API keys
 */
export class LocalAIService {
  private modelName: string;
  private pipe: any = null;
  private isModelLoading: boolean = false;
  private modelLoadPromise: Promise<any> | null = null;

  constructor(modelName: string = 'Xenova/distilgpt2') {
    this.modelName = modelName;
  }

  /**
   * Load the model if it's not already loaded
   */
  private async loadModel(): Promise<any> {
    if (this.pipe) {
      return this.pipe;
    }

    if (this.modelLoadPromise) {
      return this.modelLoadPromise;
    }

    console.log(`Loading local AI model: ${this.modelName}`);
    this.isModelLoading = true;

    try {
      this.modelLoadPromise = pipeline('text-generation', this.modelName);
      this.pipe = await this.modelLoadPromise;
      console.log('Local AI model loaded successfully');
      return this.pipe;
    } catch (error) {
      console.error('Error loading local AI model:', error);
      this.modelLoadPromise = null;
      throw error;
    } finally {
      this.isModelLoading = false;
    }
  }

  /**
   * Generate a response to a prompt using the local model
   */
  async generateResponse(prompt: string, options: { maxTokens?: number, frameworkContext?: string } = {}): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      // Enhance the prompt with any framework context
      const enhancedPrompt = options.frameworkContext 
        ? `${options.frameworkContext}\n\nQuestion: ${prompt}\n\nAnswer:` 
        : prompt;
      
      // Load model if not already loaded
      const model = await this.loadModel();
      
      // Generate response
      const result = await model(enhancedPrompt, {
        max_new_tokens: options.maxTokens || 256,
        temperature: 0.7,
        top_k: 50,
        top_p: 0.95,
        repetition_penalty: 1.2,
        do_sample: true,
      });
      
      const generatedText = result[0].generated_text;
      
      // Clean up response to remove the prompt
      const response = generatedText.substring(enhancedPrompt.length).trim();
      
      const processingTime = (Date.now() - startTime) / 1000;
      return { text: response, processingTime };
    } catch (error) {
      console.error('Error generating local AI response:', error);
      throw error;
    }
  }

  /**
   * Switch to a different model
   */
  async switchModel(newModelName: string): Promise<boolean> {
    if (this.modelName === newModelName) {
      return true; // No change needed
    }

    console.log(`Switching local AI model from ${this.modelName} to ${newModelName}`);
    this.modelName = newModelName;
    this.pipe = null;
    this.modelLoadPromise = null;
    
    try {
      await this.loadModel(); // Preload the model
      return true;
    } catch (error) {
      console.error(`Failed to switch to model ${newModelName}:`, error);
      return false;
    }
  }

  /**
   * Get information about the currently loaded model
   */
  getModelInfo(): { modelName: string, isLoaded: boolean, isLoading: boolean } {
    return {
      modelName: this.modelName,
      isLoaded: !!this.pipe,
      isLoading: this.isModelLoading
    };
  }

  /**
   * Get a list of recommended models for different use cases
   */
  static getRecommendedModels(): { [key: string]: string } {
    return {
      default: 'Xenova/distilgpt2',
      small: 'Xenova/gpt2-tiny',
      balanced: 'Xenova/gpt2-medium',
      business: 'Xenova/bloom-560m', 
      multilingual: 'Xenova/mGPT'
    };
  }
}

// Export a singleton instance with the default model
export const localAIService = new LocalAIService();
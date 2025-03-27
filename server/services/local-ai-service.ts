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
      // Format with clear separators for better generation
      const enhancedPrompt = `### INSTRUCTION ###
${prompt}

### ANSWER ###
`;
      
      // Load model if not already loaded
      const model = await this.loadModel();
      
      // Generate response with improved parameters
      const result = await model(enhancedPrompt, {
        max_new_tokens: options.maxTokens || 500,
        temperature: 0.8,          // Slightly more creative
        top_k: 40,                 // Focus on more likely tokens
        top_p: 0.92,               // Sample from top probability tokens
        repetition_penalty: 1.3,   // Higher penalty for repetition
        do_sample: true,           // Use sampling for more variety
        num_beams: 3,              // Use beam search for more coherent text
        no_repeat_ngram_size: 3,   // Avoid repeating 3-grams
      });
      
      const generatedText = result[0].generated_text;
      
      // Clean up response to extract just the answer part
      const answerMarker = "### ANSWER ###";
      const responseStartIndex = generatedText.indexOf(answerMarker) + answerMarker.length;
      let response = "";
      
      if (responseStartIndex > answerMarker.length) {
        // Extract everything after the answer marker
        response = generatedText.substring(responseStartIndex).trim();
        
        // Find and remove any subsequent markers that might appear
        const stopPatterns = ["###", "Question:", "Answer:", "User:", "Response:"];
        for (const pattern of stopPatterns) {
          const patternIndex = response.indexOf(pattern);
          if (patternIndex > 0) {
            response = response.substring(0, patternIndex).trim();
          }
        }
      } else {
        // Fallback to the old method if markers aren't found
        response = generatedText.substring(enhancedPrompt.length).trim();
      }
      
      // Remove any incomplete sentences at the end
      if (response.length > 0) {
        const lastPeriodIndex = response.lastIndexOf('.');
        const lastExclamationIndex = response.lastIndexOf('!');
        const lastQuestionIndex = response.lastIndexOf('?');
        
        // Find the last sentence ending
        const lastSentenceEnd = Math.max(lastPeriodIndex, lastExclamationIndex, lastQuestionIndex);
        
        // If we found a sentence ending and it's not at the very end
        if (lastSentenceEnd > 0 && lastSentenceEnd < response.length - 1) {
          response = response.substring(0, lastSentenceEnd + 1);
        }
      }
      
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
import * as tf from '@tensorflow/tfjs';
import { pipeline, env } from '@xenova/transformers';

// Configure the transformer environment
env.allowLocalModels = true;
env.useBrowserCache = true;

// Define the interface for model options
interface ModelOptions {
  name: string;
  description: string;
  size: 'small' | 'medium' | 'large';
  languages: string[];
  useCase: string;
}

// Define the interface for the AI response
interface AIResponse {
  text: string;
  processingTime: number;
}

/**
 * LocalAIClient - Provides in-browser AI capabilities without requiring API keys
 */
export class LocalAIClient {
  private modelName: string;
  private pipe: any = null;
  private isModelLoading: boolean = false;
  private modelLoadPromise: Promise<any> | null = null;
  private isModelSupportChecked: boolean = false;
  private isWebGLSupported: boolean = false;
  private isWebGPUSupported: boolean = false;

  constructor(modelName: string = 'Xenova/distilgpt2') {
    this.modelName = modelName;
    this.checkHardwareSupport();
  }

  /**
   * Check what hardware acceleration is available
   */
  private async checkHardwareSupport(): Promise<void> {
    if (this.isModelSupportChecked) return;

    // Check WebGL support (for TensorFlow.js)
    try {
      await tf.ready();
      this.isWebGLSupported = true;
      console.log('TensorFlow.js is ready. WebGL supported.');
    } catch (error) {
      console.warn('WebGL support not detected:', error);
      this.isWebGLSupported = false;
    }

    // Check WebGPU support
    try {
      this.isWebGPUSupported = typeof navigator !== 'undefined' && 
        'gpu' in navigator;
      
      if (this.isWebGPUSupported) {
        console.log('WebGPU is supported in this browser');
      } else {
        console.log('WebGPU is not supported in this browser');
      }
    } catch (error) {
      console.warn('Error checking WebGPU support:', error);
      this.isWebGPUSupported = false;
    }

    this.isModelSupportChecked = true;
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
   * Check if the browser environment supports running local models efficiently
   */
  canRunLocalModels(): { supported: boolean; reason?: string; accelerated: boolean } {
    if (!this.isModelSupportChecked) {
      this.checkHardwareSupport();
    }

    // Check if the browser environment is adequate
    if (typeof window === 'undefined') {
      return { supported: false, reason: 'Browser environment not detected', accelerated: false };
    }

    // Check if we have WebGL or WebGPU support
    const accelerated = this.isWebGLSupported || this.isWebGPUSupported;
    
    if (!accelerated) {
      return { 
        supported: true, 
        reason: 'Hardware acceleration not available. Performance may be limited.',
        accelerated: false
      };
    }

    return { supported: true, accelerated: true };
  }

  /**
   * Generate a response to a prompt using the local model
   */
  async generateResponse(prompt: string, options: { maxTokens?: number, frameworkContext?: string } = {}): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      // Check browser compatibility
      const compatibility = this.canRunLocalModels();
      if (!compatibility.supported) {
        throw new Error(`Local AI not supported: ${compatibility.reason}`);
      }
      
      // Enhance the prompt with any framework context
      const enhancedPrompt = options.frameworkContext 
        ? `${options.frameworkContext}\n\nQuestion: ${prompt}\n\nAnswer:` 
        : prompt;
      
      // Load model if not already loaded
      const model = await this.loadModel();
      
      // Generate response
      const result = await model(enhancedPrompt, {
        max_new_tokens: options.maxTokens || 100,
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
   * Get information about available hardware acceleration
   */
  getHardwareInfo(): { webgl: boolean, webgpu: boolean } {
    if (!this.isModelSupportChecked) {
      this.checkHardwareSupport();
    }
    
    return {
      webgl: this.isWebGLSupported,
      webgpu: this.isWebGPUSupported
    };
  }

  /**
   * Get available models with descriptions
   */
  static getAvailableModels(): ModelOptions[] {
    return [
      {
        name: 'Xenova/distilgpt2',
        description: 'Lightweight GPT-2 model, good balance of size and quality',
        size: 'small',
        languages: ['English'],
        useCase: 'General purpose text generation'
      },
      {
        name: 'Xenova/gpt2-tiny',
        description: 'Very small GPT-2 variant for resource-constrained environments',
        size: 'small',
        languages: ['English'],
        useCase: 'Simple text completions'
      },
      {
        name: 'Xenova/bloom-560m',
        description: 'Multilingual model trained on business and professional content',
        size: 'medium',
        languages: ['English', 'French', 'Spanish', 'Arabic', 'Chinese'],
        useCase: 'Business and professional content'
      },
      {
        name: 'Xenova/mGPT',
        description: 'Multilingual GPT model with support for 60+ languages',
        size: 'medium',
        languages: ['Multiple (60+)'],
        useCase: 'Multilingual text generation'
      }
    ];
  }
}

// Export a singleton instance
export const localAIClient = new LocalAIClient();
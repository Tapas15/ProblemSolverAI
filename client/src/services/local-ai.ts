
interface Problem {
  domain: string;
  complexity: 'low' | 'medium' | 'high';
  timeframe: 'short' | 'medium' | 'long';
}

export function recommendFramework(problem: Problem) {
  if (problem.complexity === 'high' && problem.timeframe === 'long') {
    return 'First Principles Thinking';
  }
  if (problem.domain === 'business' && problem.complexity === 'medium') {
    return 'SWOT Analysis';
  }
  if (problem.timeframe === 'short' && problem.complexity === 'low') {
    return 'SCAMPER';
  }
  return 'MECE Framework';
}

export function analyzeProblemComplexity(description: string): Problem['complexity'] {
  const words = description.toLowerCase().split(' ');
  const complexityIndicators = ['complex', 'difficult', 'challenging', 'multi-faceted'];
  const matches = words.filter(word => complexityIndicators.includes(word));
  return matches.length > 2 ? 'high' : matches.length > 0 ? 'medium' : 'low';
}
import { Framework } from '../types';

interface ProblemFeatures {
  complexity: number;
  timeRequired: number;
  domain: string;
  keywords: string[];
}

export class FrameworkRecommender {
  private trainingData: Array<{
    features: ProblemFeatures;
    framework: Framework;
  }> = [];

  train(problem: string, selectedFramework: Framework) {
    const features = this.extractFeatures(problem);
    this.trainingData.push({ features, framework: selectedFramework });
  }

  predict(problem: string): Framework {
    const features = this.extractFeatures(problem);
    return this.findBestMatch(features);
  }

  private extractFeatures(problem: string): ProblemFeatures {
    const text = problem.toLowerCase();
    return {
      complexity: this.calculateComplexity(text),
      timeRequired: this.estimateTimeRequired(text),
      domain: this.detectDomain(text),
      keywords: this.extractKeywords(text)
    };
  }

  private calculateComplexity(text: string): number {
    const complexityIndicators = ['complex', 'difficult', 'challenging'];
    return complexityIndicators.filter(word => text.includes(word)).length;
  }

  private estimateTimeRequired(text: string): number {
    const timeIndicators = ['urgent', 'quick', 'immediate'];
    return timeIndicators.filter(word => text.includes(word)).length;
  }

  private detectDomain(text: string): string {
    const domains = {
      business: ['revenue', 'profit', 'market'],
      technology: ['system', 'software', 'platform'],
      operations: ['process', 'workflow', 'efficiency']
    };

    for (const [domain, keywords] of Object.entries(domains)) {
      if (keywords.some(k => text.includes(k))) return domain;
    }
    return 'general';
  }

  private extractKeywords(text: string): string[] {
    return text.split(' ').filter(word => word.length > 3);
  }

  private findBestMatch(features: ProblemFeatures): Framework {
    if (this.trainingData.length === 0) {
      return 'MECE' as Framework;
    }
    // Simple matching based on domain and complexity
    return this.trainingData[0].framework;
  }
}

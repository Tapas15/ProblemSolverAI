
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

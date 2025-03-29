// Professional certificate descriptions for each framework
export const certificateDescriptions: Record<string, string> = {
  "MECE": "This certifies expertise in Mutually Exclusive, Collectively Exhaustive methodology for structured problem analysis. The recipient has demonstrated proficiency in breaking down complex problems into comprehensive, non-overlapping components for superior business decision-making.",
  
  "Jobs-To-Be-Done": "This recognizes mastery of the Jobs-To-Be-Done framework for customer-centric innovation. The holder has proven their ability to identify customer needs, analyze market opportunities, and develop solutions that address core functional and emotional jobs customers aim to accomplish.",
  
  "SWOT": "This certifies proficiency in SWOT Analysis for strategic planning. The recipient has demonstrated expertise in evaluating organizational Strengths, Weaknesses, Opportunities, and Threats to develop actionable business strategies and competitive advantage.",
  
  "Porter's Five Forces": "This validates expertise in Porter's Five Forces framework for industry analysis. The holder has demonstrated advanced capability in assessing competitive dynamics, evaluating market positions, and developing strategies that address key competitive pressures.",
  
  "First Principles Thinking": "This recognizes mastery of First Principles Thinking methodology. The recipient has demonstrated superior analytical skills in breaking down complex problems to their fundamental truths and building innovative solutions from essential elements rather than by analogy.",
  
  "Blue Ocean Strategy": "This certifies expertise in Blue Ocean Strategy for market creation. The holder has proven their ability to identify uncontested market spaces, develop value innovation, and create strategic moves that reshape industry boundaries and customer expectations.",
  
  "SCAMPER": "This validates proficiency in the SCAMPER innovation framework. The recipient has demonstrated exceptional ability in applying Substitution, Combination, Adaptation, Modification, Put to other uses, Elimination, and Reversal techniques for product and service innovation.",
  
  "Design Thinking": "This recognizes mastery of Design Thinking methodology for human-centered innovation. The holder has proven their capacity to empathize with users, define problems, ideate solutions, prototype concepts, and test implementations to create impactful solutions.",
  
  "Problem-Tree Analysis": "This certifies expertise in Problem-Tree Analysis for root cause identification. The recipient has demonstrated proficiency in mapping causal relationships between problems, identifying core issues, and developing targeted interventions that address fundamental challenges.",
  
  "Pareto Principle": "This validates mastery of the Pareto Principle (80/20 Rule) for business optimization. The holder has demonstrated exceptional ability to identify vital few factors that drive the majority of outcomes, enabling focused decision-making and resource allocation."
};

// Default description for frameworks not in the list
export const defaultCertificateDescription = 
  "This certifies proficiency in professional business framework methodology and strategic problem-solving. The recipient has demonstrated advanced analytical skills, implementation capabilities, and comprehensive understanding of framework principles.";

// Get the certificate description for a given framework name
export function getCertificateDescription(frameworkName: string): string {
  return certificateDescriptions[frameworkName] || defaultCertificateDescription;
}
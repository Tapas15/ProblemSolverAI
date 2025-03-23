// This script adds quiz data for all frameworks
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function addQuizzes() {
  try {
    console.log('Starting to add quizzes...');
    
    // Get all frameworks
    const frameworksResult = await pool.query(`
      SELECT id, name FROM frameworks
    `);
    
    const frameworks = frameworksResult.rows;
    console.log(`Found ${frameworks.length} frameworks`);
    
    // Quiz data for each framework
    for (const framework of frameworks) {
      console.log(`Adding quizzes for framework: ${framework.name} (ID: ${framework.id})`);
      
      // Add beginner quiz (5 questions)
      await addQuiz({
        frameworkId: framework.id,
        title: `${framework.name} - Beginner Quiz`,
        description: `Test your basic knowledge of the ${framework.name}`,
        level: 'beginner',
        timeLimit: 10,
        passingScore: 60,
        questionCount: 5
      });
      
      // Add intermediate quiz (10 questions)
      await addQuiz({
        frameworkId: framework.id,
        title: `${framework.name} - Intermediate Quiz`,
        description: `Test your deeper understanding of the ${framework.name}`,
        level: 'intermediate',
        timeLimit: 15,
        passingScore: 70,
        questionCount: 10
      });
      
      // Add advanced quiz (15 questions)
      await addQuiz({
        frameworkId: framework.id,
        title: `${framework.name} - Advanced Quiz`,
        description: `Demonstrate your mastery of the ${framework.name}`,
        level: 'advanced',
        timeLimit: 25,
        passingScore: 80,
        questionCount: 15
      });
    }
    
    console.log('Successfully added all quizzes!');
  } catch (error) {
    console.error('Error adding quizzes:', error);
  } finally {
    pool.end();
  }
}

async function addQuiz({ frameworkId, title, description, level, timeLimit, passingScore, questionCount }) {
  // Generate appropriate questions based on the framework ID and level
  const questions = generateQuestions(frameworkId, level, questionCount);
  
  const questionsJson = JSON.stringify(questions);
  
  // Insert quiz into database
  await pool.query(`
    INSERT INTO quizzes 
    (framework_id, title, description, level, questions, time_limit, passing_score, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [frameworkId, title, description, level, questionsJson, timeLimit, passingScore, true]);
  
  console.log(`  - Added ${level} quiz: ${title} with ${questionCount} questions`);
}

function generateQuestions(frameworkId, level, count) {
  const questions = [];
  
  // Get framework-specific questions based on the framework ID
  const frameworkQuestions = getQuestionsForFramework(frameworkId, level);
  
  // Take the appropriate number of questions
  for (let i = 0; i < count && i < frameworkQuestions.length; i++) {
    questions.push(frameworkQuestions[i]);
  }
  
  return questions;
}

function getQuestionsForFramework(frameworkId, level) {
  const questions = {
    // MECE Framework (ID: 1)
    1: {
      beginner: [
        {
          id: 1,
          text: "What does MECE stand for?",
          options: [
            "Mutually Exclusive, Collectively Exhaustive",
            "Multiple Elements, Coordinated Evaluation",
            "Measured Examples, Careful Execution",
            "Managed Elements, Collective Examination"
          ],
          correctAnswer: 0
        },
        {
          id: 2,
          text: "Which of the following best describes 'Mutually Exclusive' in MECE?",
          options: [
            "Categories that overlap with each other",
            "Categories that do not overlap with each other",
            "Categories that are comprehensive",
            "Categories that are ranked by importance"
          ],
          correctAnswer: 1
        },
        {
          id: 3,
          text: "Which of the following best describes 'Collectively Exhaustive' in MECE?",
          options: [
            "Categories that cover all possible aspects of the problem",
            "Categories that are detailed and complex",
            "Categories that exclude irrelevant information",
            "Categories that are arranged hierarchically"
          ],
          correctAnswer: 0
        },
        {
          id: 4,
          text: "The MECE framework was popularized by which consulting firm?",
          options: [
            "Boston Consulting Group",
            "Bain & Company",
            "McKinsey & Company",
            "Deloitte"
          ],
          correctAnswer: 2
        },
        {
          id: 5,
          text: "Which of the following is a benefit of using the MECE framework?",
          options: [
            "It prioritizes solutions based on implementation difficulty",
            "It ensures a complete analysis without redundant elements",
            "It focuses only on the most important factors",
            "It provides statistical validation of hypotheses"
          ],
          correctAnswer: 1
        },
        {
          id: 6,
          text: "What is a common application of the MECE framework in business?",
          options: [
            "Financial forecasting",
            "Employee performance evaluation",
            "Problem structuring and analysis",
            "Product pricing strategy"
          ],
          correctAnswer: 2
        },
        {
          id: 7,
          text: "Which of these is an example of a MECE categorization?",
          options: [
            "Products divided into 'popular', 'innovative', and 'others'",
            "Customers divided into 'frequent buyers', 'infrequent buyers', and 'non-buyers'",
            "Markets divided into 'domestic', 'international', and 'growing markets'",
            "Resources divided into 'human resources', 'financial resources', and 'successful resources'"
          ],
          correctAnswer: 1
        }
      ],
      intermediate: [
        {
          id: 1,
          text: "When using the MECE framework for market segmentation, which approach is most appropriate?",
          options: [
            "Segmenting by demographics, psychographics, and behavior simultaneously",
            "Identifying overlapping segments to capture complex customer profiles",
            "Creating distinct, non-overlapping segments that cover the entire market",
            "Focusing only on the most profitable segments"
          ],
          correctAnswer: 2
        },
        {
          id: 2,
          text: "What is the relationship between issue trees and the MECE principle?",
          options: [
            "Issue trees should avoid using the MECE principle to remain flexible",
            "Issue trees structured using MECE principles are more comprehensive and logical",
            "Issue trees replace the need for MECE categorization",
            "Issue trees are used before applying MECE principles"
          ],
          correctAnswer: 1
        },
        {
          id: 3,
          text: "A company wants to analyze reasons for customer churn. Which of these categorizations best follows MECE principles?",
          options: [
            "Product issues, service issues, price issues, and competitor offers",
            "Quality problems, delivery problems, and customer dissatisfaction",
            "Technical factors, economic factors, and customer experience factors",
            "Product-related, price-related, service-related, and external factors"
          ],
          correctAnswer: 3
        },
        {
          id: 4,
          text: "Which of the following would NOT be considered a MECE breakdown of a company's expenses?",
          options: [
            "Fixed costs vs. Variable costs",
            "Operating expenses vs. Capital expenditures",
            "Essential expenses vs. Non-essential expenses",
            "Marketing costs, Administrative costs, Production costs, and Research costs"
          ],
          correctAnswer: 2
        },
        {
          id: 5,
          text: "Why is the MECE principle important in data analysis?",
          options: [
            "It allows analysts to focus only on the most important data points",
            "It ensures all data is considered without double-counting",
            "It simplifies complex data by removing outliers",
            "It provides a quantitative framework for statistical analysis"
          ],
          correctAnswer: 1
        },
        {
          id: 6,
          text: "When is the MECE framework LEAST helpful?",
          options: [
            "When exploring creative solutions requiring thinking outside traditional categories",
            "When breaking down a complex business problem into components",
            "When organizing data for a comprehensive analysis",
            "When ensuring all aspects of a problem have been considered"
          ],
          correctAnswer: 0
        },
        {
          id: 7,
          text: "How does the MECE principle improve communication in business contexts?",
          options: [
            "By creating technical jargon that simplifies complex ideas",
            "By organizing information in a clear, non-redundant structure",
            "By focusing communication on only the most critical issues",
            "By creating a hierarchical structure for information"
          ],
          correctAnswer: 1
        },
        {
          id: 8,
          text: "Which of the following is a valid critique of the MECE framework?",
          options: [
            "It overcomplifies complex problems by breaking them down",
            "It requires too much data to be practical",
            "It can lead to artificial categorization that doesn't reflect real-world complexity",
            "It is too time-consuming for most business applications"
          ],
          correctAnswer: 2
        },
        {
          id: 9,
          text: "How would you apply the MECE principle to analyze declining sales?",
          options: [
            "Focus on the most likely causes first, then examine minor factors",
            "Divide causes into internal (product, pricing, promotion) and external (economy, competition) factors",
            "Create overlapping categories to capture complex relationships between factors",
            "Prioritize causes based on their estimated impact on sales"
          ],
          correctAnswer: 1
        },
        {
          id: 10,
          text: "Which industries benefit MOST from applying MECE principles?",
          options: [
            "All industries benefit equally from MECE principles",
            "Only industries with quantitative data can effectively use MECE",
            "Creative industries benefit more than analytical industries",
            "Industries with complex problems benefit more than those with simple challenges"
          ],
          correctAnswer: 3
        },
        {
          id: 11,
          text: "When conducting a business analysis using MECE, what should you do if you discover overlapping categories?",
          options: [
            "Keep the categories as they are if the overlap is minimal",
            "Combine the overlapping categories into a single category",
            "Redefine the categories to eliminate the overlap",
            "Use a different framework instead of MECE"
          ],
          correctAnswer: 2
        },
        {
          id: 12,
          text: "What is a 'MECE breach' in business analysis?",
          options: [
            "When categories are redefined during analysis",
            "When categories overlap or fail to cover all possibilities",
            "When analysis is done without proper authorization",
            "When the MECE framework is applied incorrectly"
          ],
          correctAnswer: 1
        }
      ],
      advanced: [
        {
          id: 1,
          text: "A consulting team is analyzing a client's supply chain issues using the MECE framework. Which approach demonstrates the most sophisticated application of MECE principles?",
          options: [
            "Creating categories of 'manufacturing issues', 'logistics issues', and 'other issues'",
            "Developing a two-dimensional matrix with internal/external factors on one axis and operational/strategic factors on the other",
            "Dividing issues by department responsible (production, logistics, purchasing, etc.)",
            "Segmenting issues by node in the supply chain (suppliers, manufacturing, distribution, retail) with sub-categories at each node"
          ],
          correctAnswer: 3
        },
        {
          id: 2,
          text: "In what way does the MECE principle interact with the concept of '80/20' or Pareto principle in business analysis?",
          options: [
            "MECE and Pareto are contradictory approaches that cannot be used together",
            "MECE ensures comprehensive analysis, while Pareto helps prioritize findings for action",
            "Pareto is applied first to identify key areas, then MECE is used within those areas",
            "MECE replaces the need for Pareto analysis in modern business consulting"
          ],
          correctAnswer: 1
        },
        {
          id: 3,
          text: "How would you address the criticism that MECE categorizations can create artificial boundaries that don't reflect real-world complexity?",
          options: [
            "Use nested MECE structures with increasingly granular categories",
            "Integrate systems thinking with MECE by acknowledging interactions while maintaining distinct categories",
            "Replace MECE with different frameworks when dealing with complex adaptive systems",
            "Add an 'interaction effects' category to standard MECE breakdowns"
          ],
          correctAnswer: 1
        },
        {
          id: 4,
          text: "A global corporation is using MECE to analyze reasons for varying performance across regions. Which approach demonstrates the deepest understanding of MECE principles?",
          options: [
            "Dividing factors into controllable vs uncontrollable, then sub-categorizing each",
            "Creating separate MECE frameworks for each region, then comparing results",
            "Using a standard set of KPIs across all regions to enable direct comparison",
            "Constructing a multi-level MECE tree with macro factors (economic, political, cultural) and micro factors (operational, marketing, etc.)"
          ],
          correctAnswer: 3
        },
        {
          id: 5,
          text: "When applying MECE to complex organizational transformation, which approach is most sophisticated?",
          options: [
            "Focusing only on structural changes that can be clearly categorized",
            "Creating separate MECE frameworks for each department involved",
            "Integrating both tangible (processes, structure, systems) and intangible (culture, capabilities, leadership) factors in a nested MECE framework",
            "Prioritizing factors by implementation difficulty rather than attempting comprehensive categorization"
          ],
          correctAnswer: 2
        },
        {
          id: 6,
          text: "Which scenario demonstrates the most advanced application of MECE principles in strategic decision-making?",
          options: [
            "Using MECE to create an exhaustive list of options before evaluating each",
            "Applying MECE to both the option generation and option evaluation phases",
            "Using MECE to identify the single best approach by process of elimination",
            "Creating a decision tree where each node represents a MECE breakdown of relevant factors"
          ],
          correctAnswer: 3
        },
        {
          id: 7,
          text: "How should MECE principles be modified when analyzing problems with significant uncertainty?",
          options: [
            "MECE should be abandoned in favor of more flexible approaches",
            "Extra categories should be added to account for 'unknown unknowns'",
            "MECE should be applied to 'what we know' and 'what we don't know' as separate domains",
            "MECE should include probabilistic categories that account for different uncertainty scenarios"
          ],
          correctAnswer: 3
        },
        {
          id: 8,
          text: "A consulting team is analyzing a market with rapidly evolving technology. How should they apply MECE principles to avoid creating a framework that quickly becomes obsolete?",
          options: [
            "Focus on underlying customer needs rather than specific technologies",
            "Create broader, less specific categories that can accommodate new developments",
            "Use a different framework better suited to dynamic environments",
            "Design a multi-level MECE framework where lower levels can be updated without changing the main structure"
          ],
          correctAnswer: 3
        },
        {
          id: 9,
          text: "Which of the following represents the most sophisticated integration of MECE with other analytical frameworks?",
          options: [
            "Using SWOT analysis within each MECE category",
            "Starting with Porter's Five Forces and then using MECE to analyze each force",
            "Creating a hybrid approach where MECE is used for problem structuring and BCG matrix for solution evaluation",
            "Developing a custom analytical approach that uses MECE principles for categorical structuring while incorporating systems dynamics for relationship mapping"
          ],
          correctAnswer: 3
        },
        {
          id: 10,
          text: "In what way does computational thinking relate to MECE principles in advanced business analytics?",
          options: [
            "Computational thinking replaces MECE in data-driven organizations",
            "MECE provides structure for the problem decomposition aspect of computational thinking",
            "Computational thinking and MECE are fundamentally incompatible approaches",
            "MECE is only used after computational analysis to organize results"
          ],
          correctAnswer: 1
        },
        {
          id: 11,
          text: "A multinational company needs to evaluate potential new markets for expansion. Which represents the most sophisticated application of MECE principles?",
          options: [
            "Dividing markets by continent, then by country, then by region",
            "Categorizing markets by industry maturity, competitive intensity, and regulatory environment",
            "Creating a multidimensional framework with market attractiveness factors and company capability factors",
            "Using cluster analysis to identify market groups, then applying MECE within each cluster"
          ],
          correctAnswer: 2
        },
        {
          id: 12,
          text: "How would you address the criticism that MECE is too rigid for complex adaptive systems like market behavior?",
          options: [
            "Acknowledge that MECE is inappropriate for such systems and use alternative methods",
            "Apply MECE at a higher level of abstraction where categories remain valid despite system complexity",
            "Create dynamic MECE frameworks that evolve as the system changes",
            "Use multiple complementary MECE frameworks that capture different aspects of the system"
          ],
          correctAnswer: 3
        },
        {
          id: 13,
          text: "When analyzing financial performance using MECE, which approach demonstrates the most sophisticated understanding?",
          options: [
            "Breaking down performance by traditional accounting categories (revenue, costs, etc.)",
            "Dividing performance into operational and strategic drivers across multiple timeframes",
            "Creating a value driver tree with MECE branches at each level of analysis",
            "Focusing only on the metrics that show the largest deviation from targets"
          ],
          correctAnswer: 2
        },
        {
          id: 14,
          text: "How should a data scientist integrate MECE principles with machine learning approaches?",
          options: [
            "Use MECE to organize input variables before model development",
            "Apply MECE only to the interpretation of model outputs",
            "Create MECE categories of models to test against the data",
            "Use MECE principles in feature engineering while recognizing the importance of interaction effects in model building"
          ],
          correctAnswer: 3
        },
        {
          id: 15,
          text: "Which scenario demonstrates the most advanced understanding of both the strengths and limitations of MECE?",
          options: [
            "Using MECE for all business problems because of its logical structure",
            "Avoiding MECE for complex problems because of its limitations",
            "Selectively applying MECE where appropriate while supplementing with other approaches for areas where strict categorization is limiting",
            "Creating custom categorization approaches for each problem rather than following MECE"
          ],
          correctAnswer: 2
        }
      ]
    },
    // SWOT Framework (ID: 3)
    3: {
      beginner: [
        {
          id: 1,
          text: "What does SWOT stand for?",
          options: [
            "Strengths, Weaknesses, Opportunities, Threats",
            "Strategic Ways Of Thinking",
            "Success With Operational Tactics",
            "System-Wide Organizational Techniques"
          ],
          correctAnswer: 0
        },
        {
          id: 2,
          text: "Which of these is an internal factor in SWOT analysis?",
          options: [
            "Market trends",
            "Competitors' actions",
            "Company expertise",
            "Economic conditions"
          ],
          correctAnswer: 2
        },
        {
          id: 3,
          text: "Which of these is an external factor in SWOT analysis?",
          options: [
            "Company culture",
            "Staff skills",
            "Technological changes",
            "Production capacity"
          ],
          correctAnswer: 2
        },
        {
          id: 4,
          text: "When is the best time to conduct a SWOT analysis?",
          options: [
            "Only during times of crisis",
            "When starting a new venture or making major decisions",
            "Only after a competitive analysis has been completed",
            "On a strict annual schedule"
          ],
          correctAnswer: 1
        },
        {
          id: 5,
          text: "Which quadrant of SWOT analysis identifies positive internal factors?",
          options: [
            "Weaknesses",
            "Opportunities",
            "Threats",
            "Strengths"
          ],
          correctAnswer: 3
        },
        {
          id: 6,
          text: "Which quadrant of SWOT analysis identifies negative external factors?",
          options: [
            "Weaknesses",
            "Opportunities",
            "Threats",
            "Strengths"
          ],
          correctAnswer: 2
        },
        {
          id: 7,
          text: "What is a key benefit of conducting a SWOT analysis?",
          options: [
            "It provides detailed financial projections",
            "It gives a comprehensive view of internal and external factors affecting an organization",
            "It guarantees business success",
            "It replaces the need for market research"
          ],
          correctAnswer: 1
        }
      ],
      intermediate: [
        {
          id: 1,
          text: "How should a company best use the 'Opportunities' identified in a SWOT analysis?",
          options: [
            "Immediately pursue all identified opportunities",
            "Match opportunities with strengths to develop strategic advantages",
            "Focus only on the opportunities with the highest potential revenue",
            "Address all weaknesses before pursuing any opportunities"
          ],
          correctAnswer: 1
        },
        {
          id: 2,
          text: "What is a TOWS matrix in relation to SWOT analysis?",
          options: [
            "An alternative name for SWOT analysis",
            "A framework that examines the interactions between SWOT components to formulate strategies",
            "A method to prioritize the most important factors in each SWOT quadrant",
            "A technique to validate SWOT findings with external stakeholders"
          ],
          correctAnswer: 1
        },
        {
          id: 3,
          text: "Which of the following is a limitation of SWOT analysis?",
          options: [
            "It provides too much quantitative data",
            "It can be subjective and overly simplistic",
            "It focuses too narrowly on financial factors",
            "It takes too long to implement"
          ],
          correctAnswer: 1
        },
        {
          id: 4,
          text: "How can a company address the 'Threats' identified in a SWOT analysis?",
          options: [
            "Ignore threats that seem unlikely to materialize",
            "Develop contingency plans only for the most serious threats",
            "Convert threats into opportunities where possible and develop defensive strategies",
            "Focus solely on internal strengths to outweigh external threats"
          ],
          correctAnswer: 2
        },
        {
          id: 5,
          text: "What strategy might be appropriate when a company identifies significant weaknesses but also substantial opportunities?",
          options: [
            "Immediately address all weaknesses before pursuing opportunities",
            "Ignore the weaknesses and focus only on capitalizing on opportunities",
            "Pursue a joint venture or partnership to leverage others' strengths",
            "Maintain the status quo until the external environment changes"
          ],
          correctAnswer: 2
        },
        {
          id: 6,
          text: "How often should a SWOT analysis be updated?",
          options: [
            "Once when a company is founded",
            "Only when facing a crisis",
            "Regularly, as both internal and external factors change over time",
            "Every five years at minimum"
          ],
          correctAnswer: 2
        },
        {
          id: 7,
          text: "What is a potential pitfall when conducting a SWOT analysis?",
          options: [
            "Gathering too much data",
            "Including too many stakeholders in the process",
            "Listing factors without developing corresponding strategies",
            "Focusing too much on quantitative analysis"
          ],
          correctAnswer: 2
        },
        {
          id: 8,
          text: "How does SWOT analysis complement other strategic planning tools?",
          options: [
            "SWOT replaces the need for other strategic tools",
            "SWOT provides a high-level framework that can inform more detailed analyses",
            "SWOT should only be used after other strategic tools",
            "SWOT is only useful for small businesses, while other tools are better for large organizations"
          ],
          correctAnswer: 1
        },
        {
          id: 9,
          text: "Which approach is most effective when using SWOT for competitive analysis?",
          options: [
            "Focus only on your company's strengths versus competitors' weaknesses",
            "Conduct separate SWOT analyses for each major competitor and compare",
            "Use SWOT only for your own company and a different framework for competitors",
            "Share SWOT analyses with competitors to encourage collaboration"
          ],
          correctAnswer: 1
        },
        {
          id: 10,
          text: "How can a company ensure its SWOT analysis leads to actionable strategies?",
          options: [
            "Hire external consultants to conduct the SWOT analysis",
            "Involve only senior management in the SWOT process",
            "Connect SWOT findings to specific objectives and develop corresponding action plans",
            "Focus primarily on strengths and opportunities while minimizing weaknesses and threats"
          ],
          correctAnswer: 2
        }
      ],
      advanced: [
        {
          id: 1,
          text: "How might the concept of 'dynamic capabilities' enhance a traditional SWOT analysis for a technology company?",
          options: [
            "By adding a fifth dimension focused exclusively on adaptability",
            "By highlighting that strengths and weaknesses are situational and may change rapidly in different contexts",
            "By replacing SWOT with a completely different framework",
            "By focusing the analysis only on technological factors"
          ],
          correctAnswer: 1
        },
        {
          id: 2,
          text: "A multinational corporation is conducting a global strategic review using SWOT. Which approach demonstrates the most sophisticated understanding of the framework?",
          options: [
            "Creating a single SWOT analysis that applies to all regions",
            "Developing regional SWOT analyses and then aggregating them",
            "Creating a multi-level SWOT where corporate-level factors are analyzed alongside region-specific factors",
            "Replacing SWOT with a different framework for international strategy"
          ],
          correctAnswer: 2
        },
        {
          id: 3,
          text: "In a rapidly changing industry, what is the most sophisticated approach to address the static nature of traditional SWOT analysis?",
          options: [
            "Conducting SWOT analyses more frequently",
            "Using scenario planning in conjunction with SWOT to assess strengths and weaknesses under different possible futures",
            "Focusing only on short-term opportunities and threats",
            "Excluding factors that might change quickly from the analysis"
          ],
          correctAnswer: 1
        },
        {
          id: 4,
          text: "How might a company integrate blue ocean strategy concepts with SWOT analysis?",
          options: [
            "Replace the 'Opportunities' quadrant with 'Blue Ocean Opportunities'",
            "Use SWOT to identify areas of value innovation by analyzing which strengths could address unmet market opportunities",
            "Conduct SWOT analysis only on existing market spaces",
            "Avoid using SWOT altogether as blue ocean strategy rejects competitive analysis"
          ],
          correctAnswer: 1
        },
        {
          id: 5,
          text: "What approach to SWOT demonstrates the most sophisticated understanding of organizational ambidexterity?",
          options: [
            "Separating the SWOT analysis into 'exploitation' and 'exploration' sections",
            "Conducting two separate SWOT analyses - one focused on current operations and another on innovation",
            "Integrating paradoxical thinking into SWOT by identifying factors that may be simultaneously strengths and weaknesses in different contexts",
            "Focusing SWOT only on innovation activities"
          ],
          correctAnswer: 2
        },
        {
          id: 6,
          text: "How might a systems thinking approach enhance traditional SWOT analysis?",
          options: [
            "By adding a fifth dimension for system dynamics",
            "By analyzing interconnections between SWOT factors and identifying feedback loops",
            "By replacing SWOT with causal loop diagrams",
            "By limiting SWOT to factors that fit within a systems framework"
          ],
          correctAnswer: 1
        },
        {
          id: 7,
          text: "How can a company best integrate SWOT analysis with stakeholder theory?",
          options: [
            "Conduct separate SWOT analyses for each stakeholder group",
            "Include only stakeholder concerns that align with company priorities",
            "Incorporate multi-stakeholder perspectives within each SWOT quadrant and analyze how factors affect different stakeholders",
            "Use SWOT only for shareholders and a different framework for other stakeholders"
          ],
          correctAnswer: 2
        },
        {
          id: 8,
          text: "What approach to SWOT analysis would be most effective for a company considering a major digital transformation?",
          options: [
            "Focus only on digital strengths and weaknesses",
            "Create a traditional SWOT first, then a separate digital SWOT",
            "Integrate digital capabilities assessment across all four quadrants while adding dynamic elements to account for rapid technological change",
            "Avoid SWOT analysis entirely for digital transformation initiatives"
          ],
          correctAnswer: 2
        },
        {
          id: 9,
          text: "How might a company use advanced analytics to enhance SWOT analysis?",
          options: [
            "By replacing qualitative SWOT factors with quantitative metrics",
            "By using data mining to identify patterns across SWOT factors that might not be apparent through traditional analysis",
            "By focusing only on factors that can be quantified",
            "By creating statistical models to predict future strengths and weaknesses"
          ],
          correctAnswer: 1
        },
        {
          id: 10,
          text: "In what way does the resource-based view (RBV) of the firm enhance the 'Strengths' quadrant of SWOT analysis?",
          options: [
            "It narrows the focus to only financial resources",
            "It provides a framework for assessing whether resources are valuable, rare, inimitable, and non-substitutable",
            "It suggests eliminating the 'Strengths' quadrant entirely",
            "It focuses strengths analysis only on human resources"
          ],
          correctAnswer: 1
        },
        {
          id: 11,
          text: "How would a sophisticated approach to SWOT address cognitive biases in the analysis process?",
          options: [
            "Include only objective, measurable factors",
            "Use external consultants to eliminate bias",
            "Employ structured techniques like pre-mortem analysis and devil's advocate approaches to challenge assumptions",
            "Focus only on past performance data"
          ],
          correctAnswer: 2
        },
        {
          id: 12,
          text: "How might a company best integrate SWOT analysis with strategic foresight methodologies?",
          options: [
            "Conduct SWOT only after strategic foresight exercises",
            "Use SWOT to evaluate alternative future scenarios by assessing how strengths and weaknesses might evolve in each",
            "Focus SWOT only on the present and use other tools for the future",
            "Create separate 'future strengths' and 'future weaknesses' quadrants"
          ],
          correctAnswer: 1
        },
        {
          id: 13,
          text: "What is the most sophisticated approach to addressing the criticism that SWOT leads to 'analysis paralysis'?",
          options: [
            "Limit the number of factors in each quadrant",
            "Set a strict time limit for completing the analysis",
            "Structure the SWOT process with clear decision points and establish criteria for determining when sufficient analysis has been conducted",
            "Focus only on the most obvious factors"
          ],
          correctAnswer: 2
        },
        {
          id: 14,
          text: "How would a company best integrate SWOT analysis with scenario planning in a highly uncertain environment?",
          options: [
            "Create separate SWOT analyses for each scenario",
            "Use SWOT for the most likely scenario only",
            "Develop a core SWOT reflecting current realities, then overlay scenario-specific factors to identify robust strategies",
            "Abandon SWOT in favor of scenario planning"
          ],
          correctAnswer: 2
        },
        {
          id: 15,
          text: "What approach to SWOT demonstrates the most sophisticated understanding of its integration with competitive dynamics?",
          options: [
            "Focusing primarily on competitor weaknesses",
            "Analyzing how strengths might become weaknesses and opportunities might become threats as competitors respond",
            "Conducting separate SWOT analyses for each competitor",
            "Including only sustainable competitive advantages in the strengths quadrant"
          ],
          correctAnswer: 1
        }
      ]
    },
    // First Principles Framework (ID: 5)
    5: {
      beginner: [
        {
          id: 1,
          text: "What is First Principles thinking?",
          options: [
            "Analyzing problems based on historical precedents",
            "Breaking down complex problems to their most basic, foundational elements",
            "Prioritizing the most urgent issues first",
            "Following established best practices in your industry"
          ],
          correctAnswer: 1
        },
        {
          id: 2,
          text: "Who is often credited with popularizing First Principles thinking in modern business?",
          options: [
            "Jeff Bezos",
            "Warren Buffett",
            "Elon Musk",
            "Bill Gates"
          ],
          correctAnswer: 2
        },
        {
          id: 3,
          text: "Which ancient philosopher is associated with the origins of First Principles thinking?",
          options: [
            "Plato",
            "Socrates",
            "Aristotle",
            "Confucius"
          ],
          correctAnswer: 2
        },
        {
          id: 4,
          text: "What technique is commonly used to identify first principles?",
          options: [
            "SWOT analysis",
            "The Five Whys",
            "Porter's Five Forces",
            "The BCG matrix"
          ],
          correctAnswer: 1
        },
        {
          id: 5,
          text: "Which of the following is NOT a characteristic of First Principles thinking?",
          options: [
            "Challenging assumptions",
            "Breaking down complex problems",
            "Relying on established precedents",
            "Seeking foundational truths"
          ],
          correctAnswer: 2
        },
        {
          id: 6,
          text: "What is the opposite of First Principles thinking?",
          options: [
            "Systems thinking",
            "Design thinking",
            "Analogical thinking",
            "Critical thinking"
          ],
          correctAnswer: 2
        },
        {
          id: 7,
          text: "Which of these would be considered an example of First Principles thinking?",
          options: [
            "Designing a new product based on what competitors are doing",
            "Following industry best practices for manufacturing processes",
            "Rethinking an entire business model by questioning basic assumptions",
            "Implementing processes that have worked for similar businesses"
          ],
          correctAnswer: 2
        }
      ],
      intermediate: [
        {
          id: 1,
          text: "How does First Principles thinking differ from analogical reasoning?",
          options: [
            "First Principles is faster while analogical reasoning is more thorough",
            "First Principles breaks things down to basic truths while analogical reasoning uses comparisons to known examples",
            "First Principles focuses on the future while analogical reasoning focuses on the past",
            "First Principles is qualitative while analogical reasoning is quantitative"
          ],
          correctAnswer: 1
        },
        {
          id: 2,
          text: "How might a company apply First Principles thinking to cost reduction?",
          options: [
            "Benchmark against industry averages and aim to beat them",
            "Implement standard cost-cutting measures used by similar companies",
            "Examine each cost component and question whether it's truly necessary for value creation",
            "Focus cuts on the largest expense categories first"
          ],
          correctAnswer: 2
        },
        {
          id: 3,
          text: "What is the relationship between First Principles thinking and innovation?",
          options: [
            "First Principles thinking often leads to incremental improvements rather than breakthrough innovations",
            "First Principles thinking can lead to radical innovation by questioning fundamental assumptions",
            "First Principles thinking is primarily useful for process innovation but not product innovation",
            "First Principles thinking is too theoretical to lead to practical innovations"
          ],
          correctAnswer: 1
        },
        {
          id: 4,
          text: "What is 'reasoning from first principles' in the context of business strategy?",
          options: [
            "Starting with the company's mission statement and working outward",
            "Examining what customers fundamentally need rather than what they say they want",
            "Breaking down strategic challenges to their fundamental truths before building new solutions",
            "Prioritizing long-term goals over short-term objectives"
          ],
          correctAnswer: 2
        },
        {
          id: 5,
          text: "Which of these statements about First Principles thinking is most accurate?",
          options: [
            "It is quick and easy to implement in any organization",
            "It often requires significant mental effort and may face resistance",
            "It is mainly useful for technical problems but not people-related issues",
            "It should completely replace analogical thinking in business"
          ],
          correctAnswer: 1
        },
        {
          id: 6,
          text: "How might First Principles thinking be applied to understanding customer needs?",
          options: [
            "By analyzing what competitors are offering their customers",
            "By using industry standard customer segmentation models",
            "By asking what fundamental problem the customer is trying to solve",
            "By focusing on demographic data about customers"
          ],
          correctAnswer: 2
        },
        {
          id: 7,
          text: "Which of these is a limitation of First Principles thinking?",
          options: [
            "It can be time-consuming and resource-intensive",
            "It is only applicable in scientific contexts",
            "It cannot generate creative solutions",
            "It can only be practiced by those with specialized training"
          ],
          correctAnswer: 0
        },
        {
          id: 8,
          text: "How might First Principles thinking help with organizational change?",
          options: [
            "By encouraging the adoption of best practices from other organizations",
            "By questioning fundamental assumptions about how work should be organized",
            "By implementing standard change management procedures",
            "By focusing only on the most visible problems"
          ],
          correctAnswer: 1
        },
        {
          id: 9,
          text: "Which cognitive bias most directly interferes with First Principles thinking?",
          options: [
            "Recency bias",
            "Status quo bias",
            "Optimism bias",
            "Dunning-Kruger effect"
          ],
          correctAnswer: 1
        },
        {
          id: 10,
          text: "How does Socratic questioning relate to First Principles thinking?",
          options: [
            "They are completely different approaches",
            "Socratic questioning can help identify assumptions to challenge via First Principles",
            "Socratic questioning is a more advanced form of First Principles thinking",
            "Socratic questioning focuses on people while First Principles focuses on processes"
          ],
          correctAnswer: 1
        }
      ],
      advanced: [
        {
          id: 1,
          text: "A CEO wants to reimagine their company's approach to innovation using First Principles thinking. Which approach demonstrates the deepest understanding of the framework?",
          options: [
            "Studying other innovative companies and adopting their practices",
            "Deconstructing the innovation process to identify and challenge implicit assumptions about how value is created",
            "Focusing innovation efforts exclusively on emerging technologies",
            "Creating a separate innovation department with its own budget and goals"
          ],
          correctAnswer: 1
        },
        {
          id: 2,
          text: "How might First Principles thinking interact with systems thinking in solving complex organizational problems?",
          options: [
            "They are incompatible approaches that cannot be used together",
            "First Principles breaks down components while systems thinking reconstructs their interactions",
            "Systems thinking should be used first, followed by First Principles",
            "First Principles is more effective and should replace systems thinking"
          ],
          correctAnswer: 1
        },
        {
          id: 3,
          text: "In what way does First Principles thinking relate to the concept of creative destruction in business?",
          options: [
            "They are opposing concepts that cannot coexist",
            "First Principles thinking provides the intellectual foundation for identifying opportunities for creative destruction",
            "Creative destruction happens naturally while First Principles requires deliberate application",
            "Creative destruction applies to industries while First Principles applies to products"
          ],
          correctAnswer: 1
        },
        {
          id: 4,
          text: "A company is applying First Principles thinking to their market expansion strategy. Which approach demonstrates the most sophisticated understanding?",
          options: [
            "Analyzing which markets similar companies have successfully entered",
            "Identifying the fundamental value proposition of their offering and matching it to the core needs of different potential markets",
            "Entering the largest available markets first to maximize potential returns",
            "Focusing on markets with the least competition"
          ],
          correctAnswer: 1
        },
        {
          id: 5,
          text: "How might an organization integrate First Principles thinking with scenario planning in their strategic process?",
          options: [
            "Replace scenario planning with First Principles thinking",
            "Use First Principles to challenge the basic assumptions of each scenario",
            "Apply First Principles first, then develop scenarios afterward",
            "Use scenario planning for external factors and First Principles for internal factors"
          ],
          correctAnswer: 1
        },
        {
          id: 6,
          text: "What approach to business model innovation demonstrates the deepest understanding of First Principles thinking?",
          options: [
            "Adopting business models that have proven successful in adjacent industries",
            "Incrementally improving the existing business model based on customer feedback",
            "Decomposing the business into its fundamental value creation and capture mechanisms, then reimagining these elements",
            "Focusing innovation efforts on the most profitable aspects of the current business model"
          ],
          correctAnswer: 2
        },
        {
          id: 7,
          text: "How might First Principles thinking be applied to address cognitive biases in decision-making?",
          options: [
            "By replacing intuitive decisions with data-driven ones",
            "By identifying and challenging the fundamental assumptions that underlie cognitive biases",
            "By implementing standard decision-making protocols",
            "By delegating important decisions to groups rather than individuals"
          ],
          correctAnswer: 1
        },
        {
          id: 8,
          text: "What is the relationship between First Principles thinking and disruptive innovation as described by Clayton Christensen?",
          options: [
            "They are contradictory approaches to innovation",
            "First Principles thinking can help identify opportunities for disruptive innovation by questioning basic industry assumptions",
            "Disruptive innovation is a specific application of First Principles in technology industries",
            "First Principles focuses on high-end disruption while Christensen's theory focuses on low-end disruption"
          ],
          correctAnswer: 1
        },
        {
          id: 9,
          text: "A multinational corporation wants to apply First Principles thinking to their organizational structure. What approach demonstrates the most sophisticated understanding?",
          options: [
            "Benchmarking against other successful multinational structures",
            "Questioning fundamental assumptions about coordination, control, and communication needs across the organization",
            "Implementing a standard matrix or divisional structure",
            "Focusing restructuring efforts on underperforming divisions"
          ],
          correctAnswer: 1
        },
        {
          id: 10,
          text: "How might First Principles thinking enhance a company's approach to digital transformation?",
          options: [
            "By identifying which digital technologies competitors are adopting",
            "By questioning fundamental assumptions about how value is created and delivered before applying digital technologies",
            "By prioritizing the implementation of the latest technologies",
            "By digitizing existing processes without changing their fundamental structure"
          ],
          correctAnswer: 1
        },
        {
          id: 11,
          text: "How does the concept of 'inverse thinking' relate to First Principles?",
          options: [
            "They are opposing approaches that cannot be used together",
            "Inverse thinking (considering what would cause failure) can help identify non-obvious assumptions for First Principles analysis",
            "Inverse thinking is a prerequisite to First Principles thinking",
            "Inverse thinking is more effective than First Principles in business contexts"
          ],
          correctAnswer: 1
        },
        {
          id: 12,
          text: "What role can First Principles thinking play in addressing complex ethical dilemmas in business?",
          options: [
            "It is not applicable to ethical questions",
            "It can help identify fundamental values and principles that should guide decision-making",
            "It should be replaced by established ethical frameworks in these situations",
            "It is only useful for technical rather than ethical challenges"
          ],
          correctAnswer: 1
        },
        {
          id: 13,
          text: "How might a company use First Principles thinking to approach sustainability challenges?",
          options: [
            "By implementing standard environmental management practices",
            "By challenging fundamental assumptions about resource usage, waste, and value creation",
            "By focusing sustainability efforts on areas that receive the most public attention",
            "By copying sustainability initiatives from industry leaders"
          ],
          correctAnswer: 1
        },
        {
          id: 14,
          text: "What is the most sophisticated understanding of how First Principles thinking relates to strategic planning?",
          options: [
            "First Principles should replace traditional strategic planning",
            "First Principles is too theoretical for practical strategic planning",
            "First Principles can help question the underlying assumptions of the strategic planning process itself",
            "First Principles is only relevant to the implementation phase of strategic planning"
          ],
          correctAnswer: 2
        },
        {
          id: 15,
          text: "How might First Principles thinking be applied to understanding and addressing organizational culture issues?",
          options: [
            "By implementing best practices from companies with strong cultures",
            "By examining the fundamental beliefs, incentives, and structures that shape behavior",
            "By focusing only on the most visible aspects of culture like rituals and symbols",
            "By addressing cultural issues only after dealing with strategic and operational concerns"
          ],
          correctAnswer: 1
        }
      ]
    }
  };
  
  // Default questions for frameworks that don't have specific questions
  const defaultQuestions = {
    beginner: [
      {
        id: 1,
        text: "What is the main purpose of this framework?",
        options: [
          "To analyze market competition",
          "To structure problem-solving approaches",
          "To improve financial performance",
          "To streamline operational processes"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "When is this framework most useful?",
        options: [
          "During crisis situations only",
          "For day-to-day operational decisions",
          "When facing complex strategic challenges",
          "Only for specific industries"
        ],
        correctAnswer: 2
      },
      {
        id: 3,
        text: "What is a key benefit of using this framework?",
        options: [
          "It guarantees successful outcomes",
          "It provides a structured approach to complex problems",
          "It eliminates the need for data analysis",
          "It works automatically without adaptation"
        ],
        correctAnswer: 1
      },
      {
        id: 4,
        text: "Which of the following is NOT a typical step in applying this framework?",
        options: [
          "Identifying the problem",
          "Analyzing relevant factors",
          "Implementing without testing",
          "Evaluating potential solutions"
        ],
        correctAnswer: 2
      },
      {
        id: 5,
        text: "What type of thinking does this framework primarily encourage?",
        options: [
          "Linear thinking",
          "Structured analytical thinking",
          "Purely creative thinking",
          "Intuitive decision-making"
        ],
        correctAnswer: 1
      }
    ],
    intermediate: [
      {
        id: 1,
        text: "How does this framework compare to other problem-solving approaches?",
        options: [
          "It is always superior to other frameworks",
          "It has unique strengths but also limitations",
          "It should replace all other analytical methods",
          "It is primarily useful for quantitative analysis"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "What is a common criticism of this framework?",
        options: [
          "It is too simple to be useful",
          "It can oversimplify complex situations",
          "It is too mathematical for business use",
          "It cannot be applied to real-world problems"
        ],
        correctAnswer: 1
      },
      {
        id: 3,
        text: "How might this framework be combined with other approaches?",
        options: [
          "It should not be combined with other frameworks",
          "It can be used sequentially after other analyses",
          "It can complement other frameworks by addressing different aspects of a problem",
          "It should only be used in combination with quantitative methods"
        ],
        correctAnswer: 2
      },
      {
        id: 4,
        text: "What is the relationship between this framework and strategic planning?",
        options: [
          "This framework replaces the need for strategic planning",
          "This framework can inform specific aspects of strategic planning",
          "Strategic planning and this framework address completely different areas",
          "This framework is only useful after strategic planning is complete"
        ],
        correctAnswer: 1
      },
      {
        id: 5,
        text: "What cognitive biases might interfere with effective application of this framework?",
        options: [
          "No cognitive biases affect this framework",
          "Only confirmation bias affects this framework",
          "Multiple biases including confirmation bias and anchoring can impact analysis",
          "This framework automatically corrects for cognitive biases"
        ],
        correctAnswer: 2
      },
      {
        id: 6,
        text: "How should data be used when applying this framework?",
        options: [
          "This framework does not require data",
          "Data should be used to validate assumptions and test conclusions",
          "Only qualitative data is relevant to this framework",
          "Only quantitative data is relevant to this framework"
        ],
        correctAnswer: 1
      },
      {
        id: 7,
        text: "How might company culture affect the implementation of this framework?",
        options: [
          "Company culture has no impact on framework implementation",
          "Only innovative cultures can use this framework effectively",
          "Organizational culture can enable or hinder effective application",
          "This framework should be used to change company culture"
        ],
        correctAnswer: 2
      },
      {
        id: 8,
        text: "What role should leadership play when implementing this framework?",
        options: [
          "Leaders should delegate framework implementation entirely",
          "Leaders should champion the approach and model its application",
          "Leadership involvement is unnecessary for this framework",
          "Only technical experts should be involved in implementation"
        ],
        correctAnswer: 1
      },
      {
        id: 9,
        text: "How might this framework be adapted for different contexts?",
        options: [
          "The framework cannot be adapted and must be used as designed",
          "Only the terminology should be changed for different industries",
          "Core principles remain the same but application can be tailored to specific contexts",
          "Different industries require completely different versions of the framework"
        ],
        correctAnswer: 2
      },
      {
        id: 10,
        text: "What is the relationship between this framework and innovation?",
        options: [
          "This framework impedes innovation by imposing structure",
          "This framework can provide structure without limiting creative solutions",
          "This framework is only useful for incremental rather than disruptive innovation",
          "Innovation and this framework are unrelated"
        ],
        correctAnswer: 1
      }
    ],
    advanced: [
      {
        id: 1,
        text: "How might this framework be integrated with complexity theory?",
        options: [
          "They are incompatible approaches",
          "This framework can be enhanced by incorporating concepts from complexity theory",
          "Complexity theory should replace this framework in complex environments",
          "This framework is only useful for simple, not complex, situations"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "How does this framework relate to organizational learning?",
        options: [
          "It has no relationship to organizational learning",
          "It can provide structure for collective learning processes",
          "It impedes learning by imposing rigid structures",
          "It is only useful for individual not organizational learning"
        ],
        correctAnswer: 1
      },
      {
        id: 3,
        text: "What is the most sophisticated understanding of how this framework relates to systems thinking?",
        options: [
          "They are contradictory approaches",
          "This framework can be enhanced by incorporating systems perspectives",
          "Systems thinking should always precede using this framework",
          "This framework is a subset of systems thinking"
        ],
        correctAnswer: 1
      },
      {
        id: 4,
        text: "How might this framework be applied to address wicked problems?",
        options: [
          "It is not applicable to wicked problems",
          "It can provide partial structure while acknowledging the limitations of any single framework",
          "It can completely solve wicked problems if applied correctly",
          "Wicked problems should be simplified before applying this framework"
        ],
        correctAnswer: 1
      },
      {
        id: 5,
        text: "What is the relationship between this framework and design thinking?",
        options: [
          "They are competing approaches that should not be used together",
          "This framework can be integrated with design thinking to combine analytical and creative approaches",
          "Design thinking should replace this framework in most situations",
          "This framework is a type of design thinking"
        ],
        correctAnswer: 1
      },
      {
        id: 6,
        text: "How might this framework be applied in cross-cultural business contexts?",
        options: [
          "This framework is culturally neutral and needs no adaptation",
          "This framework should be applied differently based on cultural context",
          "This framework is only applicable in Western business cultures",
          "Cultural factors are irrelevant to the application of this framework"
        ],
        correctAnswer: 1
      },
      {
        id: 7,
        text: "What is the most sophisticated understanding of the limitations of this framework?",
        options: [
          "This framework has no significant limitations",
          "The framework should be used with awareness of its boundaries and complemented with other approaches when necessary",
          "The limitations make this framework unsuitable for complex business environments",
          "The limitations only affect theoretical not practical applications"
        ],
        correctAnswer: 1
      },
      {
        id: 8,
        text: "How might advances in artificial intelligence and data analytics enhance the application of this framework?",
        options: [
          "They will make this framework obsolete",
          "They can provide deeper insights and more comprehensive analysis within the framework",
          "They are irrelevant to the application of this framework",
          "They will completely transform how this framework is applied"
        ],
        correctAnswer: 1
      },
      {
        id: 9,
        text: "What organizational capabilities are most important for effective implementation of this framework?",
        options: [
          "Technical expertise is the only important capability",
          "A combination of analytical skills, collaboration, and adaptive learning",
          "Financial resources are the most critical factor",
          "Industry-specific knowledge is the determining factor"
        ],
        correctAnswer: 1
      },
      {
        id: 10,
        text: "How might this framework evolve in response to changing business environments?",
        options: [
          "The framework is timeless and will not need to evolve",
          "Core principles will remain valuable but application will adapt to new contexts",
          "The framework will be replaced by entirely new approaches",
          "Only the terminology of the framework will change"
        ],
        correctAnswer: 1
      },
      {
        id: 11,
        text: "What is the relationship between this framework and strategic agility?",
        options: [
          "This framework impedes agility by imposing structure",
          "This framework can enhance agility by providing clarity while allowing flexibility",
          "Strategic agility eliminates the need for frameworks like this",
          "This framework is only useful in stable not agile environments"
        ],
        correctAnswer: 1
      },
      {
        id: 12,
        text: "How might this framework be applied to sustainability challenges?",
        options: [
          "It is not applicable to sustainability issues",
          "It can provide structure for analyzing complex sustainability challenges",
          "Sustainability issues are too complex for this framework",
          "This framework should only be applied to financial sustainability"
        ],
        correctAnswer: 1
      },
      {
        id: 13,
        text: "What ethical considerations are most important when applying this framework?",
        options: [
          "Ethical considerations are separate from the application of this framework",
          "The framework should be applied with awareness of potential impacts on stakeholders",
          "This framework automatically addresses ethical concerns",
          "Ethics only become relevant after the framework has been applied"
        ],
        correctAnswer: 1
      },
      {
        id: 14,
        text: "How should this framework be taught to maximize understanding and effective application?",
        options: [
          "Through theoretical lectures focused on concepts",
          "Through a combination of conceptual understanding and practical application",
          "Through case studies without theoretical foundation",
          "Learning this framework requires no special approach"
        ],
        correctAnswer: 1
      },
      {
        id: 15,
        text: "What is the most sophisticated understanding of how this framework contributes to competitive advantage?",
        options: [
          "Simply using this framework creates competitive advantage",
          "The framework itself is not a source of advantage, but how it is applied and integrated can be",
          "This framework is too widely known to contribute to competitive advantage",
          "This framework only contributes to operational not strategic advantage"
        ],
        correctAnswer: 1
      }
    ]
  };
  
  // If a framework doesn't have specific questions, use the default ones
  if (!questions[frameworkId]) {
    console.log(`  - Using default questions for framework ID ${frameworkId}`);
    return defaultQuestions[level];
  }
  
  return questions[frameworkId][level] || defaultQuestions[level];
}

// Execute the function
addQuizzes();
// This script will directly update the content via API calls
// Run this directly using "node seed-directly.js"

const fs = require('fs');
const path = require('path');
const http = require('http');

// Store the cookie for authenticated requests
let authCookie = null;

// Function to authenticate first
async function authenticate() {
  try {
    // Try multiple usernames for registration
    const randomId = Math.floor(Math.random() * 100000);
    
    // Try registering with a unique email and username
    const userData = {
      username: "admin" + randomId,
      password: "password123",
      email: `admin${randomId}@example.com`, // Use unique email
      name: "Admin User"
    };
    
    console.log(`Attempting to register user: ${userData.username}`);
    const response = await makeRequest('POST', '/api/register', userData);
    
    if (response.statusCode === 201 && response.headers && response.headers['set-cookie']) {
      // Extract and store the cookie
      authCookie = response.headers['set-cookie'][0].split(';')[0];
      console.log("Authentication successful through registration");
      return true;
    } else {
      console.log("Registration failed, trying existing users...");
      
      // Try a few common test accounts that might have been created earlier
      const testAccounts = [
        { username: "admin", password: "password123" },
        { username: "admin7167", password: "password123" }, // From last run
        { username: "test", password: "password123" },
        { username: "user", password: "password123" }
      ];
      
      // Try each account
      for (const account of testAccounts) {
        console.log(`Trying to login with username: ${account.username}`);
        const loginResponse = await makeRequest('POST', '/api/login', account);
        
        if (loginResponse.statusCode === 200 && loginResponse.headers && loginResponse.headers['set-cookie']) {
          authCookie = loginResponse.headers['set-cookie'][0].split(';')[0];
          console.log(`Login successful with username: ${account.username}`);
          return true;
        }
      }
    }
    
    console.error("Failed to authenticate with any account");
    return false;
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
}

// Function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Add authentication cookie if available
    if (authCookie) {
      options.headers['Cookie'] = authCookie;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          // Try to parse as JSON if possible
          const jsonData = responseData ? JSON.parse(responseData) : {};
          
          // Also return headers for cookies
          resolve({ 
            statusCode: res.statusCode, 
            data: jsonData,
            headers: res.headers 
          });
        } catch (e) {
          // If not JSON, return the raw data
          resolve({ 
            statusCode: res.statusCode, 
            data: responseData,
            headers: res.headers 
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Main function to update content
async function updateContent() {
  try {
    console.log("Starting content update...");
    
    // First, authenticate to get access to protected endpoints
    const isAuthenticated = await authenticate();
    
    if (!isAuthenticated) {
      console.error("Failed to authenticate, some operations may fail");
    }
    
    // First, update modules content
    await updateModuleContent();
    
    // Then, update quizzes
    await updateQuizzes();
    
    // Finally, update case studies
    await updateCaseStudies();
    
    console.log("Content update completed successfully!");
    
  } catch (error) {
    console.error("Error updating content:", error);
  }
}

// Update module content
async function updateModuleContent() {
  console.log("Updating module content...");
  
  const moduleContent = [
    // MECE Framework (ID: 1) - Module 1
    {
      frameworkId: 1,
      name: "MECE Fundamentals",
      description: "Learn the core concept of Mutually Exclusive, Collectively Exhaustive and its applications.",
      content: "<h2>Introduction to MECE</h2><p>MECE (Mutually Exclusive, Collectively Exhaustive) is a principle used to organize information into buckets that are:</p><ul><li>Mutually exclusive - items don't overlap</li><li>Collectively exhaustive - no items are left out</li></ul><p>The MECE principle was popularized by management consulting firm McKinsey & Company as a problem-solving framework.</p><h2>Why Use MECE?</h2><p>MECE thinking ensures a comprehensive approach to problem-solving by creating categories that don't overlap but together cover all possibilities. This helps in:</p><ul><li>Creating structured analysis</li><li>Avoiding double-counting</li><li>Ensuring nothing is missed</li><li>Communicating ideas clearly</li></ul>",
      examples: "Example 1: Segmenting a market\nA company might segment customers into: new customers, returning customers, and inactive customers. Each customer falls into exactly one category, and all customers are covered.\n\nExample 2: Analyzing costs\nA business categorizes expenses as either fixed costs or variable costs. No expense can be both, and together they account for all costs.",
      keyTakeaways: "• MECE stands for Mutually Exclusive, Collectively Exhaustive\n• Ensures comprehensive analysis without overlapping categories\n• Helps create clear structure when breaking down complex problems\n• Prevents gaps in analysis and avoids redundancy\n• Foundation for frameworks like issue trees and hypotheses",
      order: 1
    },
    // MECE Framework (ID: 1) - Module 2
    {
      frameworkId: 1,
      name: "Creating MECE Structures",
      description: "Learn how to create effective MECE structures for different types of business problems.",
      content: "<h2>Building MECE Categories</h2><p>Creating effective MECE categories is both an art and a science. The key is to find a logical organizing principle that naturally creates non-overlapping categories while covering the entire problem space.</p><h2>Common MECE Frameworks</h2><ul><li><strong>Process steps:</strong> Breaking down by sequential stages (e.g., planning, execution, evaluation)</li><li><strong>Stakeholder groups:</strong> Segmenting by different participants (e.g., customers, employees, shareholders)</li><li><strong>Geographic regions:</strong> Dividing by location (e.g., North America, Europe, Asia)</li><li><strong>Time periods:</strong> Segmenting by timeframe (e.g., short-term, medium-term, long-term)</li></ul>",
      examples: "Example 1: Revenue Sources\nA MECE breakdown of a company's revenue might include: Product Sales, Service Contracts, Licensing Fees, and Other Income. Each dollar of revenue falls into exactly one category, and all revenue is accounted for.\n\nExample 2: Customer Satisfaction Issues\nA consulting team might organize customer complaints into: Product Quality, Service Experience, Price/Value, and Delivery/Logistics - ensuring each complaint type is covered without overlap.",
      keyTakeaways: "• Choose the right organizing principle for your specific problem\n• Test your categories to ensure there are no gaps or overlaps\n• Simple categorizations often work better than complex ones\n• The right MECE structure makes the rest of your analysis clearer\n• Visualize your MECE breakdown with decision trees or matrices",
      order: 2
    },
    // MECE Framework (ID: 1) - Module 3
    {
      frameworkId: 1,
      name: "MECE Problem Analysis",
      description: "Apply MECE thinking to analyze complex business problems in a structured way.",
      content: "<h2>The MECE Problem-Solving Process</h2><p>MECE thinking forms the foundation of structured problem-solving. By systematically breaking down complex problems into mutually exclusive, collectively exhaustive components, you can analyze each part thoroughly without missing anything important.</p><h2>Steps in MECE Analysis</h2><ol><li><strong>Problem definition:</strong> Clearly articulate the problem statement</li><li><strong>Issue structuring:</strong> Create a MECE breakdown of the problem</li><li><strong>Hypothesis formation:</strong> Develop hypotheses about each component</li><li><strong>Data gathering:</strong> Collect information to test each hypothesis</li><li><strong>Analysis:</strong> Evaluate findings for each component</li><li><strong>Synthesis:</strong> Combine insights into comprehensive recommendations</li></ol>",
      examples: "Example: Declining Profits Analysis\nA retail company experiencing declining profits used MECE to analyze the issue by first breaking down profit drivers into: Revenue Factors (volume, price, mix) and Cost Factors (COGS, operating expenses). Each category was further broken down in a MECE way. This structured approach revealed that while sales volume was stable, product mix had shifted toward lower-margin items, and shipping costs had increased significantly—insights that might have been missed with less structured analysis.",
      keyTakeaways: "• MECE problem-solving prevents analysis gaps and redundancies\n• Start with high-level categories and drill down as needed\n• Always test assumptions against data\n• Balance analytical rigor with practical constraints\n• Document your MECE structure for stakeholder communication",
      order: 3
    },
    // MECE Framework (ID: 1) - Module 4
    {
      frameworkId: 1,
      name: "Advanced MECE Applications",
      description: "Master advanced MECE techniques for strategic business analysis and decision-making.",
      content: "<h2>Multilevel MECE Structures</h2><p>Advanced MECE thinking involves creating nested MECE structures—issue trees that maintain MECE principles at each level of analysis. This approach allows you to tackle extremely complex business problems by methodically drilling down from high-level categories to actionable insights.</p><h2>Advanced MECE Techniques</h2><ul><li><strong>Hybrid frameworks:</strong> Combining different organizing principles across levels</li><li><strong>Parallel analysis:</strong> Analyzing the same problem from multiple MECE perspectives</li><li><strong>Quantitative weighting:</strong> Assigning numerical importance to MECE branches</li><li><strong>Hypothesis-driven MECE:</strong> Structuring issue trees around key hypotheses</li></ul>",
      examples: "Example: Strategic Transformation\nA technology company used multilevel MECE analysis to evaluate a major strategic transformation. The first level divided considerations into Market Opportunity, Internal Capabilities, Financial Impact, and Implementation Risks. Each branch was then broken down further—for instance, Market Opportunity was split into Customer Segments, Geographic Regions, and Competitive Landscape. This structured approach allowed executives to methodically evaluate complex tradeoffs and develop a robust transformation strategy.",
      keyTakeaways: "• Advanced MECE structures can handle extremely complex problems\n• Focus analysis depth on the most promising branches\n• Explicitly document assumptions at each level\n• Validate your framework with diverse stakeholders\n• Use technology tools to manage complex MECE structures",
      order: 4
    },
    // MECE Framework (ID: 1) - Module 5
    {
      frameworkId: 1,
      name: "Real-world Case Studies",
      description: "Study real-world examples where MECE principles led to breakthrough insights.",
      content: "<h2>MECE in Management Consulting</h2><p>MECE thinking originated at McKinsey & Company and remains a cornerstone of management consulting methodology. Leading consulting firms apply MECE principles to solve their clients' most challenging business problems, from operational efficiency to corporate strategy.</p><h2>MECE Beyond Consulting</h2><p>Today, MECE principles have spread beyond consulting into diverse fields including:</p><ul><li>Corporate strategic planning</li><li>Product management and development</li><li>Marketing campaign analysis</li><li>Financial modeling and valuation</li><li>Organizational design initiatives</li></ul><p>Executives increasingly use MECE frameworks to communicate complex strategies to stakeholders and ensure comprehensive analysis of business challenges.</p>",
      examples: "Example 1: Healthcare Cost Reduction\nA major hospital system used MECE analysis to systematically address rising costs. They divided cost drivers into Clinical (medical supplies, procedures, staffing), Administrative (billing, IT, management), and Facilities (maintenance, utilities, capital expenses) categories. This structured approach helped identify specific intervention points without missing any major cost centers.\n\nExample 2: Product Portfolio Strategy\nA consumer goods company applied MECE principles to optimize their product portfolio. They created a matrix with Market Growth (high/medium/low) on one axis and Competitive Position (leader/challenger/follower) on the other. This MECE segmentation allowed targeted strategies for each segment while ensuring all products were considered.",
      keyTakeaways: "• MECE thinking is essential across diverse industries and functions\n• Professionals using MECE consistently make better decisions\n• Adapt MECE principles to your specific context\n• MECE helps teams align around common frameworks\n• Organizations that institutionalize MECE thinking gain competitive advantage",
      order: 5
    },
    // Design Thinking (ID: 2) - Module 1
    {
      frameworkId: 2,
      name: "Design Thinking Fundamentals",
      description: "Introduction to the design thinking methodology and mindset.",
      content: "<h2>What is Design Thinking?</h2><p>Design Thinking is a human-centered approach to innovation that draws from the designer's toolkit to integrate the needs of people, the possibilities of technology, and the requirements for business success. It's a methodology that promotes creative problem-solving with a focus on the user.</p><h2>Core Principles</h2><p>Design Thinking is built on several key principles:</p><ul><li>Human-centered: Empathizing with the users</li><li>Collaborative: Bringing diverse perspectives together</li><li>Experimental: Testing and refining solutions</li><li>Optimistic: Believing that better solutions are possible</li></ul>",
      examples: "Example 1: IDEO Shopping Cart Project\nIDEO, a leading design firm, reimagined the shopping cart using design thinking. They observed shoppers, identified pain points, brainstormed solutions, prototyped new designs, and tested them with real users. The result was an innovative cart with features like a removable basket for checkout, child-safe seating, and improved navigation.\n\nExample 2: Airbnb Transformation\nAirbnb used design thinking to transform their struggling platform. By empathizing with hosts, they discovered that low-quality property photos were hindering bookings. Their solution was simple but effective: professional photography services for hosts. This user-centered approach helped drive their growth significantly.",
      keyTakeaways: "• Design thinking puts human needs at the center of product/service development\n• Combines creative and analytical approaches to problem-solving\n• Emphasizes rapid prototyping and iterative improvement\n• Encourages diverse perspectives and cross-functional collaboration\n• Can be applied to virtually any industry or challenge",
      order: 1
    },
    // SWOT Analysis (ID: 3) - Module 1
    {
      frameworkId: 3,
      name: "SWOT Fundamentals",
      description: "Learn the basics of SWOT analysis and when to use it.",
      content: "<h2>Understanding SWOT Analysis</h2><p>SWOT Analysis is a strategic planning technique used to help identify Strengths, Weaknesses, Opportunities, and Threats related to business competition or project planning. SWOT provides a straightforward framework that encourages strategic thinking through identifying internal and external factors that may impact success.</p><h2>The Four Components</h2><ul><li><strong>Strengths:</strong> Internal attributes and resources that support achieving objectives</li><li><strong>Weaknesses:</strong> Internal attributes and resources that hinder achieving objectives</li><li><strong>Opportunities:</strong> External factors that could be leveraged for benefit</li><li><strong>Threats:</strong> External factors that could compromise success</li></ul><h2>When to Use SWOT</h2><p>SWOT analysis is most valuable when:</p><ul><li>Exploring new initiatives or ventures</li><li>Making decisions about business strategy</li><li>Identifying areas for improvement</li><li>Adjusting and refining plans mid-course</li><li>Understanding how you compare to competitors</li></ul>",
      examples: "Example: Tesla SWOT\nStrengths: Brand recognition, innovative technology, first-mover advantage in premium EVs, vertical integration\nWeaknesses: Production challenges, high costs, limited service centers, reliance on government incentives\nOpportunities: Growing EV market, expansion to energy storage, autonomous driving technology, international expansion\nThreats: Increasing competition from traditional automakers, potential battery material shortages, regulatory changes, economic downturns affecting luxury purchases",
      keyTakeaways: "• SWOT provides a structured way to evaluate internal and external factors\n• Internal factors are Strengths and Weaknesses (things you can control)\n• External factors are Opportunities and Threats (things you can't control)\n• Effective SWOT analyses are specific and honest, not generic\n• SWOT is a starting point for strategy, not the complete answer\n• Simple framework that can be applied to almost any decision context",
      order: 1
    }
  ];
  
  for (const module of moduleContent) {
    try {
      // First get existing modules to find the matching one
      const response = await makeRequest('GET', `/api/frameworks/${module.frameworkId}/modules`);
      
      if (response.statusCode !== 200) {
        console.error(`Failed to fetch modules for framework ${module.frameworkId}`);
        continue;
      }
      
      const modules = response.data;
      const existingModule = modules.find(m => m.name === module.name || m.order === module.order);
      
      if (existingModule) {
        // Update existing module
        console.log(`Updating module: ${module.name}`);
        
        const updateResponse = await makeRequest('PATCH', `/api/modules/${existingModule.id}`, {
          content: module.content,
          examples: module.examples,
          keyTakeaways: module.keyTakeaways
        });
        
        if (updateResponse.statusCode === 200) {
          console.log(`Successfully updated module: ${module.name}`);
        } else {
          console.error(`Failed to update module ${module.name}: ${JSON.stringify(updateResponse)}`);
        }
      } else {
        // Create new module
        console.log(`Creating new module: ${module.name}`);
        
        const createResponse = await makeRequest('POST', '/api/modules', {
          frameworkId: module.frameworkId,
          name: module.name,
          description: module.description,
          content: module.content,
          examples: module.examples,
          keyTakeaways: module.keyTakeaways,
          order: module.order,
          completed: false
        });
        
        if (createResponse.statusCode === 201) {
          console.log(`Successfully created module: ${module.name}`);
        } else {
          console.error(`Failed to create module ${module.name}: ${JSON.stringify(createResponse)}`);
        }
      }
    } catch (error) {
      console.error(`Error processing module ${module.name}:`, error);
    }
  }
  
  console.log("Module content update completed.");
}

// Update quizzes
async function updateQuizzes() {
  console.log("Updating quiz data...");
  
  const quizTemplates = [
    // MECE Framework (ID: 1)
    {
      frameworkId: 1,
      title: "MECE Framework - Beginner Quiz",
      description: "Test your basic knowledge of the MECE Framework",
      level: "beginner",
      timeLimit: 10,
      passingScore: 60,
      questions: JSON.stringify([
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
        }
      ])
    },
    // Design Thinking (ID: 2)
    {
      frameworkId: 2,
      title: "Design Thinking - Beginner Quiz",
      description: "Test your basic knowledge of Design Thinking",
      level: "beginner",
      timeLimit: 10,
      passingScore: 60,
      questions: JSON.stringify([
        {
          id: 1,
          text: "What is the primary focus of Design Thinking?",
          options: [
            "Technological innovation",
            "Aesthetic design",
            "Human-centered solutions",
            "Cost efficiency"
          ],
          correctAnswer: 2
        },
        {
          id: 2,
          text: "Which of these is NOT a stage in the Design Thinking process?",
          options: [
            "Empathize",
            "Define",
            "Optimize",
            "Prototype"
          ],
          correctAnswer: 2
        }
      ])
    },
    // SWOT Analysis (ID: 3)
    {
      frameworkId: 3,
      title: "SWOT Analysis - Beginner Quiz",
      description: "Test your basic knowledge of SWOT Analysis",
      level: "beginner",
      timeLimit: 10,
      passingScore: 60,
      questions: JSON.stringify([
        {
          id: 1,
          text: "What do the letters in SWOT stand for?",
          options: [
            "Strengths, Weaknesses, Opportunities, Threats",
            "Success, Work, Obstacles, Timing",
            "Strategy, Workforce, Outcomes, Tactics",
            "Structure, Workforce, Objectives, Technology"
          ],
          correctAnswer: 0
        },
        {
          id: 2,
          text: "Which SWOT components are considered internal factors?",
          options: [
            "Strengths and Opportunities",
            "Weaknesses and Threats",
            "Strengths and Weaknesses",
            "Opportunities and Threats"
          ],
          correctAnswer: 2
        }
      ])
    }
  ];
  
  // Check if we have any quizzes already
  const allQuizzesResponse = await makeRequest('GET', '/api/quizzes');
  const quizzesExist = allQuizzesResponse.data && Array.isArray(allQuizzesResponse.data) && allQuizzesResponse.data.length > 0;
  
  for (const quiz of quizTemplates) {
    try {
      if (quizzesExist) {
        // Check if quiz already exists for this framework and level
        const response = await makeRequest('GET', `/api/quizzes?frameworkId=${quiz.frameworkId}&level=${quiz.level}`);
        const existingQuizzes = response.data;
        
        if (existingQuizzes && existingQuizzes.length > 0) {
          // Update existing quiz
          const existingQuiz = existingQuizzes[0];
          console.log(`Updating ${quiz.level} quiz for framework ID ${quiz.frameworkId}`);
          
          const updateResponse = await makeRequest('PATCH', `/api/quizzes/${existingQuiz.id}`, {
            title: quiz.title,
            description: quiz.description,
            questions: quiz.questions,
            timeLimit: quiz.timeLimit,
            passingScore: quiz.passingScore,
            isActive: true
          });
          
          if (updateResponse.statusCode === 200) {
            console.log(`Successfully updated ${quiz.level} quiz for framework ID ${quiz.frameworkId}`);
          } else {
            console.error(`Failed to update quiz: ${JSON.stringify(updateResponse)}`);
          }
          continue;
        }
      }
      
      // Create new quiz
      console.log(`Creating ${quiz.level} quiz for framework ID ${quiz.frameworkId}`);
      
      const createResponse = await makeRequest('POST', '/api/quizzes', {
        frameworkId: quiz.frameworkId,
        title: quiz.title,
        description: quiz.description,
        level: quiz.level,
        questions: quiz.questions,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        isActive: true
      });
      
      if (createResponse.statusCode === 201) {
        console.log(`Successfully created ${quiz.level} quiz for framework ID ${quiz.frameworkId}`);
      } else {
        console.error(`Failed to create quiz: ${JSON.stringify(createResponse)}`);
      }
    } catch (error) {
      console.error(`Error processing ${quiz.level} quiz for framework ${quiz.frameworkId}:`, error);
    }
  }
  
  console.log("Quiz data update completed.");
}

// Update case studies
async function updateCaseStudies() {
  console.log("Updating case studies...");
  
  const case_studies = [
    {
      frameworkId: 1, // MECE Framework
      case_study: "McKinsey's Revenue Growth Analysis\n\nMcKinsey was hired by a consumer electronics company to analyze declining revenue. They used MECE to break down possible causes into: Product factors (features, quality, pricing), Market factors (competition, demand shifts, regulations), and Operational factors (distribution, marketing, sales). Each category was further broken down in a MECE way, leading to a comprehensive analysis that identified critical issues in product pricing and distribution channels that weren't apparent initially."
    },
    {
      frameworkId: 2, // Design Thinking
      case_study: "IDEO's Shopping Cart Redesign\n\nIn the late 1990s, IDEO was challenged to redesign the shopping cart in just five days. They used Design Thinking's five stages: Empathize (observed shoppers and store employees), Define (identified pain points like maneuverability and child safety), Ideate (brainstormed hundreds of ideas), Prototype (built rough models of promising concepts), and Test (gathered feedback from actual users). The result was an innovative cart with features like a removable basket for checkout, child-safe seating, and improved navigation."
    },
    {
      frameworkId: 3, // SWOT
      case_study: "Tesla's Strategic Expansion\n\nTesla used SWOT analysis when deciding to expand into the energy storage market with Powerwall. Strengths included battery technology expertise and brand recognition. Weaknesses included manufacturing constraints and cash flow challenges. Opportunities included growing renewable energy adoption and utility partnerships. Threats included established competitors and regulatory uncertainty. The analysis helped Tesla time their market entry and position their products to leverage their strengths while mitigating weaknesses."
    }
  ];
  
  for (const item of case_studies) {
    try {
      // First get framework to ensure it exists
      const response = await makeRequest('GET', `/api/frameworks/${item.frameworkId}`);
      
      if (response.statusCode !== 200) {
        console.error(`Failed to fetch framework ${item.frameworkId}`);
        continue;
      }
      
      const framework = response.data;
      console.log(`Adding case study to framework: ${framework.name}`);
      
      const updateResponse = await makeRequest('PATCH', `/api/frameworks/${item.frameworkId}`, {
        case_studies: item.case_study
      });
      
      if (updateResponse.statusCode === 200) {
        console.log(`Successfully added case study to framework: ${framework.name}`);
      } else {
        console.error(`Failed to add case study to framework ${framework.name}: ${JSON.stringify(updateResponse)}`);
      }
    } catch (error) {
      console.error(`Error adding case study to framework ${item.frameworkId}:`, error);
    }
  }
  
  console.log("Case studies update completed.");
}

// Start the content update
updateContent();
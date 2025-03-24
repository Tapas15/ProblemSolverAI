// This script seeds the QuestionPro AI application with content for modules and quizzes
import { storage } from './server/storage.js';

// Function to seed all content
async function seedAllContent() {
  console.log('Starting to seed content...');

  try {
    // Add content to modules
    await seedModuleContent();

    // Add quiz data
    await seedQuizData();

    // Add case studies
    await seedCaseStudies();

    console.log('Content seeding complete!');

  } catch (error) {
    console.error('Error seeding content:', error);
  }
}

// Module content for all frameworks
async function seedModuleContent() {
  console.log('Seeding module content...');

  const moduleContent = [
    // MECE Framework modules (ID: 1)
    {
      frameworkId: 1,
      name: "MECE Fundamentals",
      description: "Learn the core concept of Mutually Exclusive, Collectively Exhaustive and its applications.",
      content: "<h2>Introduction to MECE</h2><p>MECE (Mutually Exclusive, Collectively Exhaustive) is a principle used to organize information into buckets that are:</p><ul><li>Mutually exclusive - items don't overlap</li><li>Collectively exhaustive - no items are left out</li></ul><div class='mb-4'><img src='https://images.unsplash.com/photo-1542744094-24638eff58bb' alt='MECE Principle Diagram' class='w-full rounded-lg shadow-md'/></div><p>The MECE principle was popularized by management consulting firm McKinsey & Company as a problem-solving framework.</p><div class='my-4'><img src='https://images.unsplash.com/photo-1552664730-d307ca884978' alt='MECE Example' class='w-full rounded-lg shadow-md'/></div><h2>Why Use MECE?</h2><p>MECE thinking ensures a comprehensive approach to problem-solving by creating categories that don't overlap but together cover all possibilities. This helps in:</p><ul><li>Creating structured analysis</li><li>Avoiding double-counting</li><li>Ensuring nothing is missed</li><li>Communicating ideas clearly</li></ul>",
      videoUrl: "https://www.youtube.com/embed/mece-introduction",
      examples: "Example 1: Segmenting a market\nA company might segment customers into: new customers, returning customers, and inactive customers. Each customer falls into exactly one category, and all customers are covered.\n\nExample 2: Analyzing costs\nA business categorizes expenses as either fixed costs or variable costs. No expense can be both, and together they account for all costs.",
      keyTakeaways: "• MECE stands for Mutually Exclusive, Collectively Exhaustive\n• Ensures comprehensive analysis without overlapping categories\n• Helps create clear structure when breaking down complex problems\n• Prevents gaps in analysis and avoids redundancy\n• Foundation for frameworks like issue trees and hypotheses",
      order: 1
    },
    {
      frameworkId: 1,
      name: "Building MECE Issue Trees",
      description: "Learn how to construct MECE issue trees to break down complex problems.",
      content: "<h2>Issue Trees in Problem Solving</h2><p>An issue tree is a graphical breakdown of a problem into components using the MECE principle. Each branch represents a distinct aspect of the problem, and together all branches capture the entire problem space.</p><h2>Creating Effective Issue Trees</h2><p>When building issue trees:</p><ul><li>Start with a clearly defined problem statement</li><li>Break down into key drivers or components</li><li>Ensure each breakdown follows MECE principles</li><li>Continue breaking down until reaching actionable insights</li></ul><p>The real power comes from disciplined thinking - each level must be both mutually exclusive and collectively exhaustive.</p>",
      examples: "Example 1: Declining Profits Analysis\nA business with declining profits might create an issue tree with three main branches:\n1. Revenue factors (further broken down into price, volume, mix)\n2. Cost factors (broken down into fixed costs, variable costs)\n3. One-time factors (unusual events affecting profit)\n\nEach branch is then further broken down in a MECE way.",
      keyTakeaways: "• Issue trees visually organize problems into MECE categories\n• Effective trees start broad and get more specific at each level\n• Each level should maintain MECE principles\n• Good issue trees lead naturally to hypothesis formation\n• The structure helps teams align on problem-solving approach",
      order: 2
    },
    {
      frameworkId: 1,
      name: "MECE in Business Communication",
      description: "How to use MECE principles to structure clear and effective business communication.",
      content: "<h2>Clear Communication with MECE</h2><p>MECE principles can dramatically improve business communication by providing clear structure. By organizing thoughts in a MECE way, you create presentations and documents that are:</p><ul><li>Logical and easy to follow</li><li>Comprehensive without being repetitive</li><li>Well-structured for decision making</li></ul><h2>Applications in Business Communication</h2><p>MECE can be applied to:</p><ul><li>Presentation structures</li><li>Report organization</li><li>Email communication</li><li>Meeting agendas</li></ul>",
      examples: "Example 1: Presentation Structure\nA project recommendation presentation organized in MECE format might include:\n- Current situation (facts, not interpretation)\n- Challenges/opportunities (the why behind the recommendation)\n- Options considered (comprehensive list of possibilities)\n- Recommended approach (specific action plan)\n- Implementation plan (timeline, resources, responsibilities)\n\nEach section covers distinct content without overlap, and together they provide the complete picture.",
      keyTakeaways: "• MECE creates clear, logical communication structure\n• Helps avoid redundancy and ensures completeness\n• Makes complex information more accessible to audiences\n• Particularly valuable in consulting and executive communications\n• Enhances credibility by demonstrating structured thinking",
      order: 3
    },

    // Design Thinking modules (ID: 2)
    {
      frameworkId: 2,
      name: "Design Thinking Fundamentals",
      description: "Introduction to the design thinking methodology and mindset.",
      content: "<h2>What is Design Thinking?</h2><p>Design Thinking is a human-centered approach to innovation that draws from the designer's toolkit to integrate the needs of people, the possibilities of technology, and the requirements for business success.</p><div class='mb-4'><img src='/images/frameworks/design-thinking-process.png' alt='Design Thinking Process' class='w-full rounded-lg shadow-md'/></div><div class='video-container my-4'><iframe src='https://www.youtube.com/embed/design-thinking-intro' title='Design Thinking Overview' class='w-full h-64 rounded-lg'></iframe></div>",
      examples: "Example 1: IDEO Shopping Cart Project\nIDEO, a leading design firm, reimagined the shopping cart using design thinking. They observed shoppers, identified pain points, brainstormed solutions, prototyped new designs, and tested them with real users. The result was an innovative cart that addressed key user needs while being feasible to manufacture.\n\nExample 2: Airbnb Transformation\nAirbnb used design thinking to transform their struggling platform. By empathizing with hosts, they discovered that low-quality property photos were hindering bookings. Their solution was simple but effective: professional photography services for hosts. This user-centered approach helped drive their growth significantly.",
      keyTakeaways: "• Design thinking puts human needs at the center of product/service development\n• Combines creative and analytical approaches to problem-solving\n• Emphasizes rapid prototyping and iterative improvement\n• Encourages diverse perspectives and cross-functional collaboration\n• Can be applied to virtually any industry or challenge",
      order: 1
    },
    {
      frameworkId: 2,
      name: "Empathize: Understanding User Needs",
      description: "Techniques for developing deep user empathy and insights.",
      content: "<h2>The Empathy Phase</h2><p>Empathy is the foundation of design thinking. This phase involves understanding the users' needs, experiences, and motivations through observation, engagement, and immersion. The goal is to set aside your own assumptions and gain genuine insight into users and their needs.</p><h2>Key Empathy Methods</h2><ul><li><strong>Observation:</strong> Watching users interact with products or environments</li><li><strong>Interviews:</strong> One-on-one conversations to understand experiences and perspectives</li><li><strong>Immersion:</strong> Experiencing what users experience firsthand</li><li><strong>Journey Mapping:</strong> Visualizing the user's experience over time</li><li><strong>Empathy Maps:</strong> Organizing observations about what users say, do, think, and feel</li></ul>",
      examples: "Example: Healthcare Service Design\nA hospital seeking to improve patient experience conducted empathy research through:\n1. Shadowing patients throughout their visit\n2. Interviewing patients, family members, and staff\n3. Having designers go through admission process themselves\n4. Creating journey maps of the entire patient experience\n\nThis research revealed unexpected pain points, like confusing wayfinding and long wait times with no status updates, which became key focus areas for redesign.",
      keyTakeaways: "• Empathy requires setting aside assumptions to truly understand users\n• Direct observation reveals insights that interviews alone might miss\n• Look for disconnects between what people say and what they do\n• Capture both emotional and functional aspects of user experiences\n• Good empathy research leads to non-obvious insights and opportunities",
      order: 2
    },
    {
      frameworkId: 2,
      name: "Define: Framing the Right Problem",
      description: "How to synthesize research into actionable problem statements.",
      content: "<h2>The Define Phase</h2><p>The Define phase bridges empathy research and ideation. It involves synthesizing observations to form a meaningful and actionable problem statement or 'Point of View' (POV). A well-crafted problem definition focuses efforts on the right challenges to solve.</p><h2>Creating Effective Problem Statements</h2><p>A good problem statement or POV:</p><ul><li>Is framed from the user's perspective</li><li>Provides focus and frames the challenge</li><li>Inspires the team and guides innovation efforts</li><li>Is neither too broad nor too narrow</li><li>Avoids proposing a solution</li></ul><p>The classic format is: [User] needs a way to [user's need] because [insight].</p>",
      examples: "Example: Education Technology\nAfter observing and interviewing students, a team might shift from a generic problem statement like \"How might we improve student engagement?\" to a more specific, insight-driven POV like:\n\n\"Time-constrained college students need a way to fit meaningful practice into their fragmented schedules because short, spaced learning sessions lead to better retention than cramming.\"\n\nThis statement contains specific user needs and insights, providing clear direction for ideation.",
      keyTakeaways: "• The Define phase transforms research into actionable problem statements\n• Focus on needs and insights, not solutions\n• Good problem statements provide constraints that spark creativity\n• Reframe problems to avoid obvious or unimaginative solutions\n• POV statements should be user-centered, not technology or business-centered",
      order: 3
    },

    // SWOT Analysis modules (ID: 3)
    {
      frameworkId: 3,
      name: "SWOT Fundamentals",
      description: "Learn the basics of SWOT analysis and when to use it.",
      content: "<h2>Understanding SWOT Analysis</h2><p>SWOT Analysis is a strategic planning technique used to help identify Strengths, Weaknesses, Opportunities, and Threats related to business competition or project planning. SWOT provides a straightforward framework that encourages strategic thinking through identifying internal and external factors that may impact success.</p><div class='mb-4'><img src='/images/frameworks/swot-matrix.png' alt='SWOT Analysis Matrix' class='w-full rounded-lg shadow-md'/></div><div class='video-container my-4'><iframe src='https://www.youtube.com/embed/swot-analysis-guide' title='SWOT Analysis Guide' class='w-full h-64 rounded-lg'></iframe></div>",
      examples: "Example: Tesla SWOT\nStrengths: Brand recognition, innovative technology, first-mover advantage in premium EVs, vertical integration\nWeaknesses: Production challenges, high costs, limited service centers, reliance on government incentives\nOpportunities: Growing EV market, expansion to energy storage, autonomous driving technology, international expansion\nThreats: Increasing competition from traditional automakers, potential battery material shortages, regulatory changes, economic downturns affecting luxury purchases",
      keyTakeaways: "• SWOT provides a structured way to evaluate internal and external factors\n• Internal factors are Strengths and Weaknesses (things you can control)\n• External factors are Opportunities and Threats (things you can't control)\n• Effective SWOT analyses are specific and honest, not generic\n• SWOT is a starting point for strategy, not the complete answer\n• Simple framework that can be applied to almost any decision context",
      order: 1
    },
    {
      frameworkId: 3,
      name: "Identifying Strengths",
      description: "Techniques for identifying and accurately assessing organizational strengths.",
      content: "<h2>Understanding Strengths</h2><p>Strengths are internal positive attributes and resources that provide advantage. They represent what your organization does well, what resources you can draw on, and what others see as your strengths.</p><h2>Key Categories of Strengths</h2><ul><li><strong>Tangible assets:</strong> Financial resources, facilities, equipment, technology</li><li><strong>Intangible assets:</strong> Brand, reputation, patents, partnerships</li><li><strong>Human resources:</strong> Employee skills, knowledge, experience, loyalty</li><li><strong>Operational capabilities:</strong> Processes, systems, methodologies</li><li><strong>Market position:</strong> Market share, customer relationships, distribution</li></ul><h2>Techniques for Identifying Strengths</h2><p>Effective strength identification involves:</p><ul><li>Using objective metrics and benchmarks</li><li>Gathering internal stakeholder perspectives</li><li>Collecting external feedback (customers, partners)</li><li>Reviewing past successes and their causes</li><li>Comparing capabilities to competitors</li></ul>",
      examples: "Example: Starbucks Strength Analysis\nWhen Starbucks conducts a strength assessment, they might identify:\n\n1. Strong global brand recognition and reputation\n2. Prime real estate locations\n3. Supply chain expertise and relationships with coffee growers\n4. Successful mobile app with high adoption rate\n5. Employee benefits leading to lower turnover than competitors\n6. Consistent customer experience across locations\n7. Product innovation capabilities\n\nThese strengths provide competitive advantages that can be leveraged for opportunities.",
      keyTakeaways: "• Focus on strengths that provide competitive differentiation\n• Consider both obvious and hidden strengths\n• Validate strengths with data and external perspectives\n• Distinguish between current strengths and developing capabilities\n• Not all strengths are equally valuable - prioritize those most relevant to objectives\n• Strengths should be specific, not generic platitudes",
      order: 2
    },
    {
      frameworkId: 3,
      name: "Identifying Weaknesses",
      description: "How to honestly assess organizational limitations and areas for improvement.",
      content: "<h2>Understanding Weaknesses</h2><p>Weaknesses are internal factors that place the organization at a disadvantage. They represent areas where the business needs to improve to remain competitive and achieve its goals.</p><h2>Key Categories of Weaknesses</h2><ul><li><strong>Resource gaps:</strong> Insufficient funding, outdated equipment, limited facilities</li><li><strong>Capability limitations:</strong> Lack of expertise, inefficient processes, inadequate systems</li><li><strong>Market deficiencies:</strong> Poor market position, weak brand, limited distribution</li><li><strong>Organizational issues:</strong> Culture problems, high turnover, leadership gaps</li><li><strong>Product/service shortcomings:</strong> Quality issues, limited features, outdated offerings</li></ul><h2>Techniques for Identifying Weaknesses</h2><p>Effective weakness identification requires:</p><ul><li>Creating a safe environment for honest assessment</li><li>Using anonymous feedback mechanisms</li><li>Reviewing customer complaints and lost sales data</li><li>Benchmarking against competitors</li><li>Analyzing failed initiatives for root causes</li></ul>",
      examples: "Example: Traditional Retailer Weakness Analysis\nA traditional retailer might identify these weaknesses:\n\n1. Limited e-commerce capabilities compared to digital natives\n2. High fixed costs from extensive physical store network\n3. Aging customer base with weak appeal to younger demographics\n4. Legacy IT systems that limit agility and data utilization\n5. Supply chain designed for store replenishment, not direct-to-consumer\n6. Organizational structure with siloed departments\n\nIdentifying these weaknesses honestly allows the company to address them proactively rather than having them exploited by competitors.",
      keyTakeaways: "• Honest weakness assessment requires creating psychological safety\n• Focus on systemic weaknesses, not individual performance issues\n• Compare against relevant benchmarks, not idealized standards\n• Prioritize weaknesses that most directly impact strategic goals\n• View weaknesses as opportunities for improvement\n• Be specific enough that action can be taken to address them",
      order: 3
    }
  ];

  // Loop through each module template and add or update content
  for (const module of moduleContent) {
    try {
      // Fetch existing modules for this framework
      const modules = await storage.getModulesByFrameworkId(module.frameworkId);

      // Find a matching module by name or order
      const existingModule = modules.find(m => 
        m.name === module.name || m.order === module.order
      );

      if (existingModule) {
        // Update existing module
        console.log(`Updating module: ${module.name}`);
        await storage.updateModule(existingModule.id, {
          content: module.content,
          examples: module.examples,
          keyTakeaways: module.keyTakeaways
        });
      } else {
        // Create new module
        console.log(`Creating new module: ${module.name}`);
        await storage.createModule({
          frameworkId: module.frameworkId,
          name: module.name,
          description: module.description,
          content: module.content,
          examples: module.examples,
          keyTakeaways: module.keyTakeaways,
          order: module.order,
          completed: false
        });
      }
    } catch (error) {
      console.error(`Error processing module ${module.name}:`, error);
    }
  }

  console.log('Module content seeding completed.');
}

// Quiz data for all frameworks
async function seedQuizData() {
  console.log('Seeding quiz data...');

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
        }
      ])
    },
    {
      frameworkId: 1,
      title: "MECE Framework - Intermediate Quiz",
      description: "Test your deeper understanding of the MECE Framework",
      level: "intermediate",
      timeLimit: 15,
      passingScore: 70,
      questions: JSON.stringify([
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
        }
      ])
    },
    {
      frameworkId: 1,
      title: "MECE Framework - Advanced Quiz",
      description: "Demonstrate your mastery of the MECE Framework",
      level: "advanced",
      timeLimit: 25,
      passingScore: 80,
      questions: JSON.stringify([
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
    {
      frameworkId: 2,
      title: "Design Thinking - Intermediate Quiz",
      description: "Test your deeper understanding of Design Thinking",
      level: "intermediate",
      timeLimit: 15,
      passingScore: 70,
      questions: JSON.stringify([
        {
          id: 1,
          text: "During the Empathize phase, which technique would be MOST effective for understanding unstated user needs?",
          options: [
            "Surveys with multiple-choice questions",
            "Contextual observation of users in their environment",
            "Focus groups with company employees",
            "Analysis of existing market research"
          ],
          correctAnswer: 1
        }
      ])
    },
    {
      frameworkId: 2,
      title: "Design Thinking - Advanced Quiz",
      description: "Demonstrate your mastery of Design Thinking",
      level: "advanced",
      timeLimit: 25,
      passingScore: 80,
      questions: JSON.stringify([
        {
          id: 1,
          text: "How does Design Thinking differ from traditional analytical business problem solving?",
          options: [
            "Design Thinking relies on intuition instead of data",
            "Design Thinking follows a linear process while traditional approaches are iterative",
            "Design Thinking emphasizes early experimentation rather than comprehensive planning",
            "Design Thinking is only suitable for product design while traditional approaches work for all business problems"
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
    },
    {
      frameworkId: 3,
      title: "SWOT Analysis - Intermediate Quiz",
      description: "Test your deeper understanding of SWOT Analysis",
      level: "intermediate",
      timeLimit: 15,
      passingScore: 70,
      questions: JSON.stringify([
        {
          id: 1,
          text: "When conducting a SWOT analysis for a new product launch, what would be considered an opportunity?",
          options: [
            "Strong engineering team",
            "Proprietary technology",
            "Untapped market segment",
            "Limited manufacturing capacity"
          ],
          correctAnswer: 2
        }
      ])
    },
    {
      frameworkId: 3,
      title: "SWOT Analysis - Advanced Quiz",
      description: "Demonstrate your mastery of SWOT Analysis",
      level: "advanced",
      timeLimit: 25,
      passingScore: 80,
      questions: JSON.stringify([
        {
          id: 1,
          text: "Which approach most effectively transforms SWOT findings into strategic action?",
          options: [
            "Focusing primarily on leveraging strengths",
            "Systematically addressing all weaknesses",
            "Creating strategic initiatives that use strengths to capitalize on opportunities",
            "Prioritizing threats based on likelihood and impact"
          ],
          correctAnswer: 2
        }
      ])
    }
  ];

  // Loop through each quiz template and add or update
  for (const quiz of quizTemplates) {
    try {
      // Check if quiz already exists for this framework and level
      const quizzes = await storage.getQuizzesByFramework(quiz.frameworkId, quiz.level);

      if (quizzes.length > 0) {
        // Update existing quiz
        const existingQuiz = quizzes[0];
        console.log(`Updating ${quiz.level} quiz for framework ID ${quiz.frameworkId}`);

        await storage.updateQuiz(existingQuiz.id, {
          title: quiz.title,
          description: quiz.description,
          questions: quiz.questions,
          timeLimit: quiz.timeLimit,
          passingScore: quiz.passingScore,
          isActive: true
        });
      } else {
        // Create new quiz
        console.log(`Creating ${quiz.level} quiz for framework ID ${quiz.frameworkId}`);

        await storage.createQuiz({
          frameworkId: quiz.frameworkId,
          title: quiz.title,
          description: quiz.description,
          level: quiz.level,
          questions: quiz.questions,
          timeLimit: quiz.timeLimit,
          passingScore: quiz.passingScore,
          isActive: true
        });
      }
    } catch (error) {
      console.error(`Error processing ${quiz.level} quiz for framework ${quiz.frameworkId}:`, error);
    }
  }

  console.log('Quiz data seeding completed.');
}

// Case studies for frameworks
async function seedCaseStudies() {
  console.log('Seeding case studies...');

  const caseStudies = [
    {
      frameworkId: 1, // MECE Framework
      caseStudy: "McKinsey's Revenue Growth Analysis\n\nMcKinsey was hired by a consumer electronics company to analyze declining revenue. They used MECE to break down possible causes into: Product factors (features, quality, pricing), Market factors (competition, demand shifts, regulations), and Operational factors (distribution, marketing, sales). Each category was further broken down in a MECE way, leading to a comprehensive analysis that identified critical issues in product pricing and distribution channels that weren't apparent initially."
    },
    {
      frameworkId: 2, // Design Thinking
      caseStudy: "IDEO's Shopping Cart Redesign\n\nIn the late 1990s, IDEO was challenged to redesign the shopping cart in just five days. They used Design Thinking's five stages: Empathize (observed shoppers and store employees), Define (identified pain points like maneuverability and child safety), Ideate (brainstormed hundreds of ideas), Prototype (built rough models of promising concepts), and Test (gathered feedback from actual users). The result was an innovative cart with features like a removable basket for checkout, child-safe seating, and improved navigation."
    },
    {
      frameworkId: 3, // SWOT
      caseStudy: "Tesla's Strategic Expansion\n\nTesla used SWOT analysis when deciding to expand into the energy storage market with Powerwall. Strengths included battery technology expertise and brand recognition. Weaknesses included manufacturing constraints and cash flow challenges. Opportunities included growing renewable energy adoption and utility partnerships. Threats included established competitors and regulatory uncertainty. The analysis helped Tesla time their market entry and position their products to leverage their strengths while mitigating weaknesses."
    }
  ];

  // Add case studies to frameworks
  for (const item of caseStudies) {
    try {
      const framework = await storage.getFramework(item.frameworkId);

      if (framework) {
        console.log(`Adding case study to framework: ${framework.name}`);

        await storage.updateFramework(item.frameworkId, {
          case_studies: item.caseStudy
        });
      }
    } catch (error) {
      console.error(`Error adding case study to framework ${item.frameworkId}:`, error);
    }
  }

  console.log('Case studies seeding completed.');
}

// Run the seeding process
seedAllContent();
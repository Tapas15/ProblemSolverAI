// migrate-add-image-fields.js
import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

async function addImageFields() {
  console.log('Adding image URL fields to frameworks and modules...');
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Add imageUrl field to frameworks table
    await pool.query(`
      ALTER TABLE frameworks
      ADD COLUMN IF NOT EXISTS image_url TEXT;
    `);
    console.log('Added image_url field to frameworks table');

    // Add imageUrl field to modules table
    await pool.query(`
      ALTER TABLE modules
      ADD COLUMN IF NOT EXISTS image_url TEXT;
    `);
    console.log('Added image_url field to modules table');

    // Populate frameworks with relevant images
    const frameworkImageMapping = [
      { id: 1, name: 'MECE Framework', image: 'https://images.unsplash.com/photo-1572177215152-32f247303126?q=80&w=500&auto=format&fit=crop' }, // MECE - structured diagram on wall
      { id: 2, name: 'Design Thinking', image: 'https://images.unsplash.com/photo-1586717799252-bd134ad00e26?q=80&w=500&auto=format&fit=crop' }, // Design Thinking - creative brainstorming
      { id: 3, name: 'SWOT Analysis', image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=500&auto=format&fit=crop' }, // SWOT - strategic planning
      { id: 4, name: 'First Principles', image: 'https://images.unsplash.com/photo-1518544801976-3e159b142a51?q=80&w=500&auto=format&fit=crop' }, // First Principles - breaking things down
      { id: 5, name: 'Porter\'s Five Forces', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=500&auto=format&fit=crop' }, // Porter's - competition analysis
      { id: 6, name: 'Jobs-To-Be-Done', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=500&auto=format&fit=crop' }, // JTBD - customer focused
      { id: 7, name: 'Blue Ocean Strategy', image: 'https://images.unsplash.com/photo-1566140967404-b8b3932483f5?q=80&w=500&auto=format&fit=crop' }, // Blue Ocean - uncharted waters
      { id: 8, name: 'SCAMPER', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=500&auto=format&fit=crop' }, // SCAMPER - creative ideation
      { id: 9, name: 'Problem Tree Analysis', image: 'https://images.unsplash.com/photo-1536009348192-756c394edd8b?q=80&w=500&auto=format&fit=crop' }, // Problem Tree - root cause tree
      { id: 10, name: 'Pareto Principle', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=500&auto=format&fit=crop' }, // Pareto - 80/20 rule charts
    ];

    // Update frameworks with images
    for (const framework of frameworkImageMapping) {
      await pool.query(`
        UPDATE frameworks 
        SET image_url = $1 
        WHERE id = $2
      `, [framework.image, framework.id]);
      console.log(`Updated image for framework: ${framework.name}`);
    }

    // Get all modules to update with random images
    const { rows: modules } = await pool.query('SELECT id, name, framework_id FROM modules ORDER BY id');
    
    // Define theme-specific module image collections
    const moduleImagesByFramework = {
      // MECE Framework (id: 1)
      1: [
        'https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?q=80&w=500&auto=format&fit=crop', // organization
        'https://images.unsplash.com/photo-1606765962248-7ff407b51667?q=80&w=500&auto=format&fit=crop', // categories
        'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=500&auto=format&fit=crop', // analysis
        'https://images.unsplash.com/photo-1542626991-cbc4e32524cc?q=80&w=500&auto=format&fit=crop'  // structure
      ],
      // Design Thinking (id: 2)
      2: [
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=500&auto=format&fit=crop', // empathize
        'https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=500&auto=format&fit=crop', // define
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=500&auto=format&fit=crop', // ideate
        'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=500&auto=format&fit=crop', // prototype
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=500&auto=format&fit=crop', // test
        'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=500&auto=format&fit=crop'  // business
      ],
      // SWOT Analysis (id: 3)
      3: [
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=500&auto=format&fit=crop', // strengths
        'https://images.unsplash.com/photo-1563461660947-507ef49e9c47?q=80&w=500&auto=format&fit=crop', // weaknesses
        'https://images.unsplash.com/photo-1533749047139-189de3cf06d3?q=80&w=500&auto=format&fit=crop', // opportunities
        'https://images.unsplash.com/photo-1594805090252-9f3e5c7cc985?q=80&w=500&auto=format&fit=crop'  // threats
      ],
      // First Principles (id: 4)
      4: [
        'https://images.unsplash.com/photo-1535378917042-10a22c95931a?q=80&w=500&auto=format&fit=crop', // fundamentals
        'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=500&auto=format&fit=crop', // application
        'https://images.unsplash.com/photo-1456428746267-a1756408f782?q=80&w=500&auto=format&fit=crop'  // innovation
      ],
      // Porter's Five Forces (id: 5)
      5: [
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=500&auto=format&fit=crop', // rivalry
        'https://images.unsplash.com/photo-1549281899-f75600a24107?q=80&w=500&auto=format&fit=crop', // new entrants
        'https://images.unsplash.com/photo-1491336477066-31156b5e4f35?q=80&w=500&auto=format&fit=crop', // suppliers
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=500&auto=format&fit=crop', // buyers
        'https://images.unsplash.com/photo-1596267952809-33e734955914?q=80&w=500&auto=format&fit=crop', // substitutes
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=500&auto=format&fit=crop'  // integration
      ],
      // Jobs-To-Be-Done (id: 6)
      6: [
        'https://images.unsplash.com/photo-1521791055366-0d553872125f?q=80&w=500&auto=format&fit=crop', // introduction
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=500&auto=format&fit=crop', // identifying
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=500&auto=format&fit=crop'  // specification
      ],
      // Blue Ocean Strategy (id: 7)
      7: [
        'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?q=80&w=500&auto=format&fit=crop', // introduction
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=500&auto=format&fit=crop', // canvas
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=500&auto=format&fit=crop', // actions
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=500&auto=format&fit=crop', // noncustomers
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=500&auto=format&fit=crop', // paths
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=500&auto=format&fit=crop', // sequence
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=500&auto=format&fit=crop'  // sustaining
      ],
      // SCAMPER (id: 8)
      8: [
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=500&auto=format&fit=crop', // intro
        'https://images.unsplash.com/photo-1579547621113-e4bb2a19bdd6?q=80&w=500&auto=format&fit=crop', // substitute
        'https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=500&auto=format&fit=crop', // combine
        'https://images.unsplash.com/photo-1496307653780-42ee777d4833?q=80&w=500&auto=format&fit=crop', // adapt
        'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=500&auto=format&fit=crop', // modify
        'https://images.unsplash.com/photo-1584277261846-c6a1672ed979?q=80&w=500&auto=format&fit=crop', // purpose
        'https://images.unsplash.com/photo-1599508704512-4a91fd346f28?q=80&w=500&auto=format&fit=crop', // eliminate
        'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=500&auto=format&fit=crop', // reverse
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=500&auto=format&fit=crop'  // business
      ],
      // Problem Tree Analysis (id: 9)
      9: [
        'https://images.unsplash.com/photo-1513001900722-370f803f498d?q=80&w=500&auto=format&fit=crop', // introduction
        'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=500&auto=format&fit=crop', // central problem
        'https://images.unsplash.com/photo-1606765962248-7ff407b51667?q=80&w=500&auto=format&fit=crop', // root causes
        'https://images.unsplash.com/photo-1579403124614-197f69d8187b?q=80&w=500&auto=format&fit=crop', // effects
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=500&auto=format&fit=crop'  // solutions
      ],
      // Pareto Principle (id: 10)
      10: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=500&auto=format&fit=crop', // 80/20 rule
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=500&auto=format&fit=crop', // vital few
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=500&auto=format&fit=crop', // time management
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=500&auto=format&fit=crop', // problem solving
        'https://images.unsplash.com/photo-1542626991-cbc4e32524cc?q=80&w=500&auto=format&fit=crop', // business strategy
        'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=500&auto=format&fit=crop'  // advanced
      ]
    };
    
    // Default images in case a module doesn't have a specific image
    const defaultImages = [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1568992687947-868a62a9f521?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500&auto=format&fit=crop'
    ];
    
    // Update modules with theme-specific images
    for (const module of modules) {
      const frameworkId = module.framework_id;
      const frameworkImages = moduleImagesByFramework[frameworkId] || defaultImages;
      const imageIndex = (module.id - 1) % frameworkImages.length;
      const imageUrl = frameworkImages[imageIndex];
      
      await pool.query(`
        UPDATE modules 
        SET image_url = $1 
        WHERE id = $2
      `, [imageUrl, module.id]);
      console.log(`Updated image for module: ${module.name} (ID: ${module.id})`);
    }

    console.log('Migration completed successfully!');
    await pool.end();
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addImageFields().catch(console.error);
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

    // Populate frameworks with default images
    const frameworkImageMapping = [
      { id: 1, name: 'MECE Framework', image: 'https://images.unsplash.com/photo-1544906503-d9e4ac448efc?q=80&w=500&auto=format&fit=crop' }, // MECE
      { id: 2, name: 'Design Thinking', image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=500&auto=format&fit=crop' }, // Design Thinking
      { id: 3, name: 'SWOT Analysis', image: 'https://images.unsplash.com/photo-1583488627499-4a9fb2d534f0?q=80&w=500&auto=format&fit=crop' }, // SWOT
      { id: 4, name: 'First Principles', image: 'https://images.unsplash.com/photo-1517373116369-9bdb8cdc9f62?q=80&w=500&auto=format&fit=crop' }, // First Principles
      { id: 5, name: 'Porter\'s Five Forces', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=500&auto=format&fit=crop' }, // Porter's
      { id: 6, name: 'Jobs-To-Be-Done', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=500&auto=format&fit=crop' }, // JTBD
      { id: 7, name: 'Blue Ocean Strategy', image: 'https://images.unsplash.com/photo-1493655430214-3dd7718460bb?q=80&w=500&auto=format&fit=crop' }, // Blue Ocean
      { id: 8, name: 'SCAMPER', image: 'https://images.unsplash.com/photo-1501084291732-13b1ba8f0ebc?q=80&w=500&auto=format&fit=crop' }, // SCAMPER
      { id: 9, name: 'Problem Tree Analysis', image: 'https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?q=80&w=500&auto=format&fit=crop' }, // Problem Tree
      { id: 10, name: 'Pareto Principle', image: 'https://images.unsplash.com/photo-1607968565043-36af90dde238?q=80&w=500&auto=format&fit=crop' }, // Pareto
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
    
    // Define image themes for modules
    const moduleImageThemes = [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1568992687947-868a62a9f521?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1536148935331-408321065b18?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1460794418188-1bb7dba2720d?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?q=80&w=500&auto=format&fit=crop'
    ];
    
    // Update modules with images
    for (const module of modules) {
      // Use module's ID modulo the length of the array to select an image
      const imageUrl = moduleImageThemes[module.id % moduleImageThemes.length];
      
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
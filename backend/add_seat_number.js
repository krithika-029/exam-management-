const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'exam_management',
  password: process.env.DB_PASSWORD || '232910',
  port: process.env.DB_PORT || 5432,
});

async function addSeatNumberColumn() {
  try {
    console.log('🔧 Adding seat_number column to seat_allocations table...');
    
    // Check if column already exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'seat_allocations' 
      AND column_name = 'seat_number'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ seat_number column already exists');
    } else {
      // Add the column
      await pool.query(`
        ALTER TABLE seat_allocations 
        ADD COLUMN seat_number INTEGER
      `);
      console.log('✅ seat_number column added successfully');
      
      // Update existing records if any
      const existingCount = await pool.query('SELECT COUNT(*) as count FROM seat_allocations');
      if (parseInt(existingCount.rows[0].count) > 0) {
        await pool.query(`
          UPDATE seat_allocations 
          SET seat_number = id 
          WHERE seat_number IS NULL
        `);
        console.log('✅ Updated existing records with seat numbers');
      }
    }
    
    // Show final table structure
    const structureResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'seat_allocations'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Updated seat_allocations table structure:');
    structureResult.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addSeatNumberColumn();

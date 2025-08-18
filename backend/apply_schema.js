const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'exam_management',
  password: process.env.DB_PASSWORD || '232910',
  port: process.env.DB_PORT || 5432,
});

async function applySchema() {
  try {
    console.log('Connecting to database...');
    
    // Read the SQL file
    const sqlFile = fs.readFileSync('./college_database.sql', 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sqlFile.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log(`✓ Statement ${i + 1} executed successfully`);
        } catch (error) {
          if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
            console.log(`⚠ Statement ${i + 1} skipped (already exists):`, statement.substring(0, 50) + '...');
          } else {
            console.error(`✗ Error in statement ${i + 1}:`, error.message);
            console.error('Statement:', statement.substring(0, 100) + '...');
          }
        }
      }
    }
    
    console.log('Schema application completed!');
    
    // Test the connection
    const result = await pool.query('SELECT COUNT(*) as student_count FROM students');
    console.log(`Current student count: ${result.rows[0].student_count}`);
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

applySchema();

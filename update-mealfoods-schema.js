// Script to update meal_foods table schema
import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function updateMealFoodsSchema() {
  try {
    console.log('Updating meal_foods table schema...\n');
    
    // Add missing columns
    await db.execute(sql`
      ALTER TABLE meal_foods 
      ADD COLUMN IF NOT EXISTS food_name VARCHAR(255)
    `);
    console.log('✓ Added food_name column');
    
    await db.execute(sql`
      ALTER TABLE meal_foods 
      ADD COLUMN IF NOT EXISTS fiber DECIMAL(8,2) DEFAULT 0
    `);
    console.log('✓ Added fiber column');
    
    await db.execute(sql`
      ALTER TABLE meal_foods 
      ADD COLUMN IF NOT EXISTS sugar DECIMAL(8,2) DEFAULT 0
    `);
    console.log('✓ Added sugar column');
    
    await db.execute(sql`
      ALTER TABLE meal_foods 
      ADD COLUMN IF NOT EXISTS sodium DECIMAL(8,2) DEFAULT 0
    `);
    console.log('✓ Added sodium column');
    
    console.log('\nSchema update completed successfully!');
    
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    process.exit(0);
  }
}

updateMealFoodsSchema();
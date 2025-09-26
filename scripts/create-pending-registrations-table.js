#!/usr/bin/env node

/**
 * Database migration script to create pending_registrations table
 * 
 * Usage:
 * node scripts/create-pending-registrations-table.js
 */

require('dotenv').config();
const { sequelize } = require('../config/db.config');

async function createPendingRegistrationsTable() {
  console.log('🏗️  Creating pending_registrations table...');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Create the pending_registrations table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS pending_registrations (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(200) NOT NULL,
        phone_number VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        role_id BIGINT NOT NULL DEFAULT 3,
        verification_token VARCHAR(6) NOT NULL,
        verification_expires_at TIMESTAMP NOT NULL,
        verification_attempts INTEGER NOT NULL DEFAULT 0,
        last_verification_attempt TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_pending_registrations_role_id 
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
      );
    `;

    await sequelize.query(createTableQuery);
    console.log('✅ pending_registrations table created successfully');

    // Create indexes
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
      CREATE INDEX IF NOT EXISTS idx_pending_registrations_verification_token ON pending_registrations(verification_token);
      CREATE INDEX IF NOT EXISTS idx_pending_registrations_verification_expires_at ON pending_registrations(verification_expires_at);
      CREATE INDEX IF NOT EXISTS idx_pending_registrations_created_at ON pending_registrations(created_at);
    `;

    await sequelize.query(createIndexesQuery);
    console.log('✅ Indexes created successfully');

    // Add trigger for updated_at
    const createTriggerQuery = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_pending_registrations_updated_at ON pending_registrations;
      CREATE TRIGGER update_pending_registrations_updated_at
        BEFORE UPDATE ON pending_registrations
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    await sequelize.query(createTriggerQuery);
    console.log('✅ Updated_at trigger created successfully');

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  createPendingRegistrationsTable()
    .then(() => {
      console.log('🎉 Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { createPendingRegistrationsTable };


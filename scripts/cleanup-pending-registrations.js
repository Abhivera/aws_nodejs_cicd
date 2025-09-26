#!/usr/bin/env node

/**
 * Cleanup script for expired pending registrations
 * This script should be run periodically (e.g., via cron job) to clean up expired registrations
 * 
 * Usage:
 * node scripts/cleanup-pending-registrations.js
 * 
 * Or add to crontab for daily cleanup:
 * 0 2 * * * cd /path/to/project && node scripts/cleanup-pending-registrations.js
 */

require('dotenv').config();
const { sequelize } = require('../config/db.config');
const AuthService = require('../services/auth.service');

async function cleanupPendingRegistrations() {
  console.log('🧹 Starting cleanup of expired pending registrations...');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Initialize auth service
    const authService = new AuthService();
    
    // Clean up expired pending registrations
    const cleanedCount = await authService.cleanupExpiredPendingRegistrations();
    
    console.log(`✅ Cleanup completed successfully. Removed ${cleanedCount} expired registrations.`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupPendingRegistrations()
    .then(() => {
      console.log('🎉 Cleanup script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Cleanup script failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupPendingRegistrations };


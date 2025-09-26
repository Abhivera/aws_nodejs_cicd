require('dotenv').config();
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const diagnoseRDS = async () => {
  console.log('🔍 RDS Connection Diagnostics\n');
  
  // 1. Check environment variables
  console.log('1. Environment Variables:');
  console.log(`   Host: ${process.env.POSTGRES_HOST}`);
  console.log(`   Port: ${process.env.POSTGRES_PORT}`);
  console.log(`   Database: ${process.env.POSTGRES_DB}`);
  console.log(`   User: ${process.env.POSTGRES_USER}`);
  console.log(`   SSL Mode: ${process.env.PGSSLMODE}\n`);

  // 2. Test DNS resolution
  console.log('2. DNS Resolution Test:');
  try {
    const { stdout } = await execAsync(`nslookup ${process.env.POSTGRES_HOST}`);
    console.log('   ✅ DNS resolution successful');
    console.log('   Resolved IP addresses:');
    const lines = stdout.split('\n');
    lines.forEach(line => {
      if (line.includes('Address:') && !line.includes('#')) {
        console.log(`   ${line.trim()}`);
      }
    });
  } catch (error) {
    console.log('   ❌ DNS resolution failed:', error.message);
  }
  console.log('');

  // 3. Test port connectivity
  console.log('3. Port Connectivity Test:');
  try {
    const { stdout } = await execAsync(`telnet ${process.env.POSTGRES_HOST} ${process.env.POSTGRES_PORT}`);
    console.log('   ✅ Port is accessible');
  } catch (error) {
    console.log('   ❌ Port connectivity failed');
    console.log('   This usually means:');
    console.log('   - Security group is blocking the connection');
    console.log('   - RDS is not publicly accessible');
    console.log('   - Firewall is blocking the connection');
  }
  console.log('');

  // 4. Test with timeout
  console.log('4. Connection Test with Timeout:');
  const { Sequelize } = require('sequelize');
  
  const sequelize = new Sequelize(
    process.env.POSTGRES_DB,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: process.env.PGSSLMODE === 'require' ? {
          require: true,
          rejectUnauthorized: false,
        } : false,
      },
      pool: {
        max: 1,
        min: 0,
        acquire: 10000, // 10 seconds timeout
        idle: 10000
      }
    }
  );

  try {
    await sequelize.authenticate();
    console.log('   ✅ Database connection successful!');
  } catch (error) {
    console.log('   ❌ Database connection failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('ETIMEDOUT')) {
      console.log('\n🔧 ETIMEDOUT Error Solutions:');
      console.log('   1. Check RDS Security Group:');
      console.log('      - Go to AWS Console → RDS → Your Database → Connectivity & Security');
      console.log('      - Click on Security Group → Edit Inbound Rules');
      console.log('      - Add rule: Type=PostgreSQL, Port=5432, Source=0.0.0.0/0 (for testing)');
      console.log('');
      console.log('   2. Check RDS Public Accessibility:');
      console.log('      - Go to AWS Console → RDS → Your Database → Connectivity & Security');
      console.log('      - Ensure "Publicly accessible" is set to "Yes"');
      console.log('');
      console.log('   3. Check VPC Configuration:');
      console.log('      - Ensure RDS is in public subnets');
      console.log('      - Check route table has internet gateway');
    }
  } finally {
    await sequelize.close();
  }
};

diagnoseRDS().catch(console.error);





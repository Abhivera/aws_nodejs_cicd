require('dotenv').config();
const { Sequelize } = require('sequelize');

// Test database connection
const testConnection = async () => {
  console.log('Testing database connection...');
  console.log('Host:', process.env.POSTGRES_HOST);
  console.log('Port:', process.env.POSTGRES_PORT);
  console.log('Database:', process.env.POSTGRES_DB);
  console.log('User:', process.env.POSTGRES_USER);
  console.log('SSL Mode:', process.env.PGSSLMODE);
  
  const sequelize = new Sequelize(
    process.env.POSTGRES_DB,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      dialect: 'postgres',
      logging: console.log,
      dialectOptions: {
        ssl: process.env.PGSSLMODE === 'require' ? {
          require: true,
          rejectUnauthorized: false,
        } : false,
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await sequelize.query('SELECT NOW() as current_time');
    console.log('✅ Query test successful:', result[0][0]);
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'SequelizeConnectionError') {
      console.log('\n🔧 Troubleshooting suggestions:');
      console.log('1. Check if your RDS instance is running');
      console.log('2. Verify security group allows inbound connections on port 5432');
      console.log('3. Check if RDS is publicly accessible');
      console.log('4. Verify your credentials are correct');
      console.log('5. Check VPC and subnet configuration');
    }
  } finally {
    await sequelize.close();
  }
};

testConnection();

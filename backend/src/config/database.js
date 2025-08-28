const { DataSource } = require('typeorm');
const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'Krorakot123456',
  database: process.env.DB_NAME || 'postgres',
  synchronize: process.env.NODE_ENV === 'development', // Auto-sync in development only
  logging: process.env.NODE_ENV === 'development',
  entities: [path.join(__dirname, '../../EnityTable/*.js')],
  migrations: [path.join(__dirname, '../migrations/*.js')],
  subscribers: [path.join(__dirname, '../subscribers/*.js')],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
    
    // Log connected entities
    const entityNames = AppDataSource.entityMetadatas.map(entity => entity.name);
    console.log('📋 Connected entities:', entityNames);
    
    // Log tables that will be created
    console.log('🔨 TypeORM will create the following tables:');
    entityNames.forEach(name => {
      console.log(`   - ${name}`);
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const closeDatabase = async () => {
  try {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

module.exports = {
  AppDataSource,
  initializeDatabase,
  closeDatabase
};

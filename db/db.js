const { Pool } = require('pg');
const path = require('path');
const fs = require('fs').promises;
const pool = new Pool(
    process.env.NODE_ENV === 'production'
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    }
    :{
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

const initializeDatabase = async () => {
    try {
        // Read schema file
        const schemaPath = path.join(__dirname, 'schema', 'schema.sql');
        try {
            await fs.access(schemaPath);
            console.log('Schema file found!');
        } catch (err) {
            console.error('Schema file not found:', err);
            return;
        }
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        // Execute schema
        await pool.query(schema);
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

if (process.env.NODE_ENV === 'production') {
    console.log('Initializing database in production mode');
    initializeDatabase();
}

pool.on("error", (err) => {
  console.error(`Error connecting to Postgres server:\n${err.stack}`);
});

module.exports = pool;
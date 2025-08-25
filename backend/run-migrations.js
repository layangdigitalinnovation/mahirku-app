const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Database configuration
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mahirku_db_2025',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'admin123',
  logging: console.log
});

async function runMigrations() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Create SequelizeMeta table if not exists
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        "name" VARCHAR(255) NOT NULL PRIMARY KEY
      );
    `);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'src', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    console.log('Found migration files:', migrationFiles);

    // Get already executed migrations
    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM "SequelizeMeta" ORDER BY name'
    );
    const executedNames = executedMigrations.map(row => row.name);

    // Run pending migrations
    for (const file of migrationFiles) {
      if (!executedNames.includes(file)) {
        console.log(`Running migration: ${file}`);
        
        const migrationPath = path.join(migrationsDir, file);
        delete require.cache[require.resolve(migrationPath)]; // Clear cache
        const migration = require(migrationPath);
        
        if (migration.up) {
          await migration.up(sequelize.getQueryInterface(), Sequelize);
          
          // Record migration as executed
          await sequelize.query(
            'INSERT INTO "SequelizeMeta" (name) VALUES (?)',
            {
              replacements: [file],
              type: Sequelize.QueryTypes.INSERT
            }
          );
          
          console.log(`✓ Migration ${file} completed successfully`);
        } else {
          console.log(`⚠ Migration ${file} has no 'up' method`);
        }
      } else {
        console.log(`⏭ Migration ${file} already executed`);
      }
    }

    // Force run new migrations for withdraw system
    const newMigrations = [
      '20250115120000-create-affiliate-balances.js',
      '20250115120001-create-withdraw-requests.js',
      '20250115120002-alter-affiliate-commissions-add-status-source.js'
    ];

    for (const file of newMigrations) {
      if (!executedNames.includes(file)) {
        console.log(`\nForce running new migration: ${file}`);
        
        const migrationPath = path.join(migrationsDir, file);
        delete require.cache[require.resolve(migrationPath)];
        const migration = require(migrationPath);
        
        if (migration.up) {
          try {
            await migration.up(sequelize.getQueryInterface(), Sequelize);
            
            // Record migration as executed
            await sequelize.query(
              'INSERT INTO "SequelizeMeta" (name) VALUES (?)',
              {
                replacements: [file],
                type: Sequelize.QueryTypes.INSERT
              }
            );
            
            console.log(`✓ New migration ${file} completed successfully`);
          } catch (error) {
            if (error.message.includes('already exists')) {
              console.log(`⚠ Table already exists for ${file}, marking as executed`);
              await sequelize.query(
                'INSERT INTO "SequelizeMeta" (name) VALUES (?) ON CONFLICT DO NOTHING',
                {
                  replacements: [file],
                  type: Sequelize.QueryTypes.INSERT
                }
              );
            } else {
              throw error;
            }
          }
        }
      }
    }

    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigrations();
import dotenv from 'dotenv';
import path from 'path';

// Load env vars explicitly before other imports if possible, or at least before usage
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app';
import { sequelize } from './config/database';
import './models';

console.log('DEBUG: Resolved PORT from env:', process.env.PORT);
const PORT = process.env.PORT || 5000;

// Add error handlers to catch crashes
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const startServer = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connected');
      await sequelize.sync();

      const server = app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
      });

      server.on('error', (err) => {
        console.error('❌ Server startup error:', err);
      });

      // Keep process alive
      setInterval(() => { }, 1000 * 60 * 60);

      return;
    } catch (error) {
      console.error(`❌ Failed to connect to DB. Retries left: ${retries - 1}`, error);
      retries -= 1;
      if (retries === 0) {
        console.error('❌ Could not connect to database after maximum retries. Exiting.');
        process.exit(1);
      }
      await wait(5000);
    }
  }
};

startServer();

import app from './app';
import { sequelize } from './config/database';
import User from './models/User';

const PORT = process.env.PORT || 5000;

// Add error handlers to catch crashes
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await User.sync();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to DB', error);
    process.exit(1);
  }
};

startServer();

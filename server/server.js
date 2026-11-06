import dotenv from 'dotenv';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 Hostel Expense Tracker Server is running!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`⏰ Timezone: Asia/Kolkata`);
      console.log(`===============================================`);
    });

    const shutdown = async () => {
      console.log('\n[Server] Shutting down gracefully...');
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] Closed connections. Exiting.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  })
  .catch((err) => {
    console.error('[Server] Fatal database connection error:', err);
    process.exit(1);
  });

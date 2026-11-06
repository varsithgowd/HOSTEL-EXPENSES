import dotenv from 'dotenv';
import os from 'os';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Helper to get local network IP
const getLocalIP = () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

// Connect to Database
connectDB()
  .then(() => {
    const server = app.listen(PORT, HOST, () => {
      const localIP = getLocalIP();
      console.log(`===============================================`);
      console.log(`🚀 Hostel Expense Tracker Server is running!`);
      console.log(`📡 Local:   http://localhost:${PORT}`);
      console.log(`📱 Network: http://${localIP}:${PORT}`);
      console.log(`🌐 Health:  http://${localIP}:${PORT}/api/health`);
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


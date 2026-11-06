import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let memServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri && !uri.includes('localhost:27017')) {
      // Direct Atlas or custom MongoDB connection
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[DB] Connected to MongoDB Atlas: ${conn.connection.host}`);
      return conn;
    }

    // Attempt local connection first if URI is localhost
    if (uri) {
      try {
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 2000,
        });
        console.log(`[DB] Connected to local MongoDB: ${conn.connection.host}`);
        return conn;
      } catch (localErr) {
        console.warn(`[DB] Local MongoDB not reachable at ${uri}. Initializing in-memory fallback...`);
      }
    }

    // In-memory fallback for immediate zero-config operation and tests
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memServer = await MongoMemoryServer.create();
      const memUri = memServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[DB] Connected to In-Memory MongoDB Server (zero-config mode): ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error('[DB] Failed to start in-memory MongoDB:', memErr.message);
      throw memErr;
    }
  } catch (error) {
    console.error(`[DB] MongoDB connection error: ${error.message}`);
    // Don't crash immediately in dev, throw to be handled in server.js
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memServer) {
      await memServer.stop();
    }
  } catch (error) {
    console.error(`[DB] Disconnect error: ${error.message}`);
  }
};


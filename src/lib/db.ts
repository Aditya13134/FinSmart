import mongoose from 'mongoose';

// Hardcoded fallback URI for development only - in production use only environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://virendra78894:Allfather001@yardstick.q7qvzhl.mongodb.net/?retryWrites=true&w=majority&appName=YardStick';

if (!MONGODB_URI) {
  console.error('MongoDB URI is not defined. Check your .env.local file');
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Add to global to prevent reconnecting on every API call
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s default
    };

    console.log('Connecting to MongoDB...');
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Failed to establish MongoDB connection:', error);
    throw error;
  }
}

export default connectDB;

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export class DatabaseConnectionError extends Error {
  code = 'DB_UNAVAILABLE';
  statusCode = 503;

  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      family: 4,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    const message =
      e instanceof Error &&
      /whitelist|ReplicaSetNoPrimary|ServerSelectionError|ENOTFOUND/i.test(e.message)
        ? 'Cannot reach MongoDB Atlas. Check Atlas Network Access (IP whitelist) and cluster status.'
        : 'Database connection failed.';
    throw new DatabaseConnectionError(message);
  }

  return cached.conn;
}

export default dbConnect;

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "mystery_message";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in your .env.local file."
  );
}

type MongooseCache = {
  conn: mongoose.Connection | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (process.env.NODE_ENV !== "production") {
  globalThis.mongooseCache = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: MONGODB_DB_NAME,
    }).catch((err) => {
      cached.promise = null; // reset on failure
      throw err;
    });
  }

  const mongooseInstance = await cached.promise;
  cached.conn = mongooseInstance.connection;

  return cached.conn;
}
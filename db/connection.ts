import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("Database already connected");
      return;
    }

    try {
      const username = process.env.MONGODB_USERNAME;
      const password = process.env.MONGODB_PASSWORD;
      const database = process.env.MONGODB_DATABASE;

      const mongoUri =
        process.env.MONGODB_URI ||
        `mongodb://${username}:${password}@localhost:27017/${database}`;

      console.log(`Connecting to MongoDB at ${mongoUri}`);

      await mongoose.connect(mongoUri);

      this.isConnected = true;
      console.log("✅ MongoDB connected successfully");

      // Create collections if they don't exist
      await this.createCollections();
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("✅ MongoDB disconnected successfully");
    } catch (error) {
      console.error("❌ MongoDB disconnection error:", error);
      throw error;
    }
  }

  private async createCollections(): Promise<void> {
    try {
      const db = mongoose.connection.db;
      if (!db) {
        console.error("❌ Database connection not available");
        return;
      }

      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map((col) => col.name);

      // Create users collection if it doesn't exist
      if (!collectionNames.includes("users")) {
        await db.createCollection("users");
        console.log("✅ Users collection created");
      }

      // Create tasks collection if it doesn't exist
      if (!collectionNames.includes("tasks")) {
        await db.createCollection("tasks");
        console.log("✅ Tasks collection created");
      }
    } catch (error) {
      console.error("❌ Error creating collections:", error);
    }
  }

  public getConnection() {
    return mongoose.connection;
  }

  public isDbConnected(): boolean {
    return this.isConnected;
  }
}

// Export the database instance
export const db = DatabaseConnection.getInstance();
export default db;

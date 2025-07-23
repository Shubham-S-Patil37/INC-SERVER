"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class DatabaseConnection {
    constructor() {
        this.isConnected = false;
    }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    async connect() {
        if (this.isConnected) {
            console.log('Database already connected');
            return;
        }
        try {
            const username = process.env.MONGODB_USERNAME;
            const password = process.env.MONGODB_PASSWORD;
            const database = process.env.MONGODB_DATABASE;
            // Use MONGODB_URI if provided, otherwise construct from individual fields
            const mongoUri = process.env.MONGODB_URI ||
                `mongodb://${username}:${password}@localhost:27017/${database}`;
            await mongoose_1.default.connect(mongoUri);
            this.isConnected = true;
            console.log('✅ MongoDB connected successfully');
            // Create collections if they don't exist
            await this.createCollections();
        }
        catch (error) {
            console.error('❌ MongoDB connection error:', error);
            throw error;
        }
    }
    async disconnect() {
        if (!this.isConnected) {
            return;
        }
        try {
            await mongoose_1.default.disconnect();
            this.isConnected = false;
            console.log('✅ MongoDB disconnected successfully');
        }
        catch (error) {
            console.error('❌ MongoDB disconnection error:', error);
            throw error;
        }
    }
    async createCollections() {
        try {
            const db = mongoose_1.default.connection.db;
            if (!db) {
                console.error('❌ Database connection not available');
                return;
            }
            const collections = await db.listCollections().toArray();
            const collectionNames = collections.map(col => col.name);
            // Create users collection if it doesn't exist
            if (!collectionNames.includes('users')) {
                await db.createCollection('users');
                console.log('✅ Users collection created');
            }
            // Create tasks collection if it doesn't exist
            if (!collectionNames.includes('tasks')) {
                await db.createCollection('tasks');
                console.log('✅ Tasks collection created');
            }
        }
        catch (error) {
            console.error('❌ Error creating collections:', error);
        }
    }
    getConnection() {
        return mongoose_1.default.connection;
    }
    isDbConnected() {
        return this.isConnected;
    }
}
// Export the database instance
exports.db = DatabaseConnection.getInstance();
exports.default = exports.db;
//# sourceMappingURL=connection.js.map
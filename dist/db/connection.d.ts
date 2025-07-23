import mongoose from 'mongoose';
declare class DatabaseConnection {
    private static instance;
    private isConnected;
    private constructor();
    static getInstance(): DatabaseConnection;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private createCollections;
    getConnection(): mongoose.Connection;
    isDbConnected(): boolean;
}
export declare const db: DatabaseConnection;
export default db;
//# sourceMappingURL=connection.d.ts.map
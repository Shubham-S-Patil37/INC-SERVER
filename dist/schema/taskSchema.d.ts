import mongoose, { Document } from 'mongoose';
export interface ITask extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    assignedTo?: mongoose.Types.ObjectId;
    dueDate?: Date;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Task: mongoose.Model<ITask, {}, {}, {}, mongoose.Document<unknown, {}, ITask, {}> & ITask & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Task;
//# sourceMappingURL=taskSchema.d.ts.map
import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  assignedTo?: number;
  assignedBy: number;
  assignedToName?: string;
  assignedByName: string;
  createdBy: number;
  updatedBy: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      required: true,
    },
    assignedTo: {
      type: Number,
      default: null,
    },
    assignedBy: {
      type: Number,
      required: [true, "AssignedBy is required"],
    },
    assignedToName: {
      type: String,
      trim: true,
      default: null,
    },
    assignedByName: {
      type: String,
      required: [true, "AssignedByName is required"],
      trim: true,
    },
    createdBy: {
      type: Number,
      required: [true, "CreatedBy is required"],
    },
    updatedBy: {
      type: Number,
      required: [true, "UpdatedBy is required"],
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ assignedBy: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ updatedBy: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ createdAt: -1 });

export const Task = mongoose.model<ITask>("Task", TaskSchema);
export default Task;

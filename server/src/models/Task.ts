import mongoose, { Document, Schema } from 'mongoose';

/**
 * Task interface
 */
export interface ITask extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  completedDate?: Date;
  relatedGoal?: mongoose.Types.ObjectId;
  relatedJournalEntry?: mongoose.Types.ObjectId;
  tags?: string[];
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task schema
 */
const taskSchema = new Schema<ITask>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    relatedGoal: {
      type: Schema.Types.ObjectId,
      ref: 'Goal',
    },
    relatedJournalEntry: {
      type: Schema.Types.ObjectId,
      ref: 'JournalEntry',
    },
    tags: [String],
    estimatedTime: {
      type: Number,
      min: 0,
    },
    actualTime: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot be more than 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Task model
 */
const Task = mongoose.model<ITask>('Task', taskSchema);

export default Task; 
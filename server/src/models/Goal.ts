import mongoose, { Document, Schema } from 'mongoose';

/**
 * Goal interface
 */
export interface IGoal extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category?: string;
  startDate: Date;
  targetDate?: Date;
  completedDate?: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'abandoned';
  priority: 'low' | 'medium' | 'high';
  progress: number; // 0-100 percentage
  relatedTasks?: mongoose.Types.ObjectId[];
  relatedThemes?: mongoose.Types.ObjectId[];
  metrics?: {
    name: string;
    targetValue: number;
    currentValue: number;
    unit?: string;
  }[];
  reflections?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Goal schema
 */
const goalSchema = new Schema<IGoal>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    category: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'abandoned'],
      default: 'not-started',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    relatedTasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    relatedThemes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Theme',
      },
    ],
    metrics: [
      {
        name: {
          type: String,
          required: true,
        },
        targetValue: {
          type: Number,
          required: true,
        },
        currentValue: {
          type: Number,
          default: 0,
        },
        unit: String,
      },
    ],
    reflections: {
      type: String,
      maxlength: [1000, 'Reflections cannot be more than 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Goal model
 */
const Goal = mongoose.model<IGoal>('Goal', goalSchema);

export default Goal; 
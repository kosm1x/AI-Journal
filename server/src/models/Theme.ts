import mongoose, { Document, Schema } from 'mongoose';

/**
 * Theme interface
 */
export interface ITheme extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  color?: string; // Hex color code
  icon?: string;
  isActive: boolean;
  relatedGoals?: mongoose.Types.ObjectId[];
  relatedJournalEntries?: mongoose.Types.ObjectId[];
  startDate?: Date;
  endDate?: Date;
  keyInsights?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Theme schema
 */
const themeSchema = new Schema<ITheme>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Theme name is required'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    color: {
      type: String,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color'],
    },
    icon: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    relatedGoals: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Goal',
      },
    ],
    relatedJournalEntries: [
      {
        type: Schema.Types.ObjectId,
        ref: 'JournalEntry',
      },
    ],
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    keyInsights: [String],
  },
  {
    timestamps: true,
  }
);

/**
 * Theme model
 */
const Theme = mongoose.model<ITheme>('Theme', themeSchema);

export default Theme; 
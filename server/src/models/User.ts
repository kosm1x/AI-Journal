import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

/**
 * User interface
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
  bio?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    emailNotifications?: boolean;
    reminderTime?: string; // Format: HH:MM
  };
  journalEntries?: mongoose.Types.ObjectId[];
  goals?: mongoose.Types.ObjectId[];
  tasks?: mongoose.Types.ObjectId[];
  themes?: mongoose.Types.ObjectId[];
  weeklyReviews?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

/**
 * User schema
 */
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    profilePicture: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot be more than 200 characters'],
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      reminderTime: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time format (HH:MM)'],
      },
    },
    journalEntries: [
      {
        type: Schema.Types.ObjectId,
        ref: 'JournalEntry',
      },
    ],
    goals: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Goal',
      },
    ],
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    themes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Theme',
      },
    ],
    weeklyReviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'WeeklyReview',
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * Hash password before saving
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

/**
 * Compare password method
 */
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generate JWT token method
 */
userSchema.methods.generateAuthToken = function (): string {
  // Use a simpler approach to avoid type issues
  return jwt.sign({ id: this._id }, config.jwtSecret, { expiresIn: '7d' });
};

/**
 * User model
 */
const User = mongoose.model<IUser>('User', userSchema);

export default User; 
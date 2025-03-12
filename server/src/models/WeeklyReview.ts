import mongoose, { Document, Schema } from 'mongoose';

/**
 * WeeklyReview interface
 */
export interface IWeeklyReview extends Document {
  user: mongoose.Types.ObjectId;
  weekStartDate: Date;
  weekEndDate: Date;
  
  // Accomplishments section
  accomplishments?: {
    description: string;
    relatedGoal?: mongoose.Types.ObjectId;
  }[];
  
  // Challenges section
  challenges?: {
    description: string;
    solution?: string;
  }[];
  
  // Learnings section
  learnings?: string[];
  
  // Goal Progress
  goalProgress?: {
    goal: mongoose.Types.ObjectId;
    previousProgress: number;
    currentProgress: number;
    notes?: string;
  }[];
  
  // Emotional wellbeing
  emotionalWellbeing?: {
    overallMood: number; // 1-10 scale
    stressLevel: number; // 1-10 scale
    energyLevel: number; // 1-10 scale
    notes?: string;
  };
  
  // Next week planning
  nextWeekPlan?: {
    focusAreas: string[];
    topPriorities: string[];
    anticipatedChallenges?: string[];
  };
  
  // AI Insights
  aiInsights?: {
    progressPatterns?: string;
    emotionalTrends?: string;
    suggestions?: string;
    generalInsights?: string;
  };
  
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * WeeklyReview schema
 */
const weeklyReviewSchema = new Schema<IWeeklyReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    weekEndDate: {
      type: Date,
      required: true,
    },
    
    // Accomplishments section
    accomplishments: [
      {
        description: {
          type: String,
          required: true,
        },
        relatedGoal: {
          type: Schema.Types.ObjectId,
          ref: 'Goal',
        },
      },
    ],
    
    // Challenges section
    challenges: [
      {
        description: {
          type: String,
          required: true,
        },
        solution: String,
      },
    ],
    
    // Learnings section
    learnings: [String],
    
    // Goal Progress
    goalProgress: [
      {
        goal: {
          type: Schema.Types.ObjectId,
          ref: 'Goal',
          required: true,
        },
        previousProgress: {
          type: Number,
          min: 0,
          max: 100,
          required: true,
        },
        currentProgress: {
          type: Number,
          min: 0,
          max: 100,
          required: true,
        },
        notes: String,
      },
    ],
    
    // Emotional wellbeing
    emotionalWellbeing: {
      overallMood: {
        type: Number,
        min: 1,
        max: 10,
      },
      stressLevel: {
        type: Number,
        min: 1,
        max: 10,
      },
      energyLevel: {
        type: Number,
        min: 1,
        max: 10,
      },
      notes: String,
    },
    
    // Next week planning
    nextWeekPlan: {
      focusAreas: [String],
      topPriorities: [String],
      anticipatedChallenges: [String],
    },
    
    // AI Insights
    aiInsights: {
      progressPatterns: String,
      emotionalTrends: String,
      suggestions: String,
      generalInsights: String,
    },
    
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * WeeklyReview model
 */
const WeeklyReview = mongoose.model<IWeeklyReview>('WeeklyReview', weeklyReviewSchema);

export default WeeklyReview; 
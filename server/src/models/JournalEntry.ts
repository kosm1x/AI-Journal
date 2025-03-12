import mongoose, { Document, Schema } from 'mongoose';

/**
 * Journal Entry interface
 */
export interface IJournalEntry extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  title?: string;
  
  // Context section
  context: string;
  detectedEmotions?: {
    emotion: string;
    intensity: number;
  }[];
  
  // Objectives & Tasks section
  objectives?: {
    title: string;
    description?: string;
    relatedGoal?: mongoose.Types.ObjectId;
    tasks?: {
      description: string;
      completed: boolean;
      dueDate?: Date;
      relatedTask?: mongoose.Types.ObjectId;
    }[];
  }[];
  
  // MindMapping section
  mindMap?: {
    topic: string;
    content: string;
    connections?: string[];
    relatedThemes?: mongoose.Types.ObjectId[];
  };
  
  // Ideate section
  ideas?: {
    description: string;
    category?: string;
    relatedGoal?: mongoose.Types.ObjectId;
    relatedTheme?: mongoose.Types.ObjectId;
  }[];
  
  // Track section
  tracking?: {
    metrics?: {
      name: string;
      value: number;
      unit?: string;
      relatedGoal?: mongoose.Types.ObjectId;
    }[];
    reflections?: string;
  };
  
  // AI Insights
  aiInsights?: {
    emotionalPatterns?: string;
    goalProgress?: string;
    suggestions?: string;
    generalInsights?: string;
  };
  
  tags?: string[];
  relatedThemes?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Journal Entry schema
 */
const journalEntrySchema = new Schema<IJournalEntry>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    
    // Context section
    context: {
      type: String,
      required: [true, 'Journal entry content is required'],
    },
    detectedEmotions: [
      {
        emotion: String,
        intensity: {
          type: Number,
          min: 0,
          max: 1,
        },
      },
    ],
    
    // Objectives & Tasks section
    objectives: [
      {
        title: {
          type: String,
          required: true,
        },
        description: String,
        relatedGoal: {
          type: Schema.Types.ObjectId,
          ref: 'Goal',
        },
        tasks: [
          {
            description: {
              type: String,
              required: true,
            },
            completed: {
              type: Boolean,
              default: false,
            },
            dueDate: Date,
            relatedTask: {
              type: Schema.Types.ObjectId,
              ref: 'Task',
            },
          },
        ],
      },
    ],
    
    // MindMapping section
    mindMap: {
      topic: {
        type: String,
        required: function() {
          return !!this.mindMap;
        },
      },
      content: {
        type: String,
        required: function() {
          return !!this.mindMap;
        },
      },
      connections: [String],
      relatedThemes: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Theme',
        },
      ],
    },
    
    // Ideate section
    ideas: [
      {
        description: {
          type: String,
          required: true,
        },
        category: String,
        relatedGoal: {
          type: Schema.Types.ObjectId,
          ref: 'Goal',
        },
        relatedTheme: {
          type: Schema.Types.ObjectId,
          ref: 'Theme',
        },
      },
    ],
    
    // Track section
    tracking: {
      metrics: [
        {
          name: {
            type: String,
            required: true,
          },
          value: {
            type: Number,
            required: true,
          },
          unit: String,
          relatedGoal: {
            type: Schema.Types.ObjectId,
            ref: 'Goal',
          },
        },
      ],
      reflections: String,
    },
    
    // AI Insights
    aiInsights: {
      emotionalPatterns: String,
      goalProgress: String,
      suggestions: String,
      generalInsights: String,
    },
    
    tags: [String],
    relatedThemes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Theme',
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * Journal Entry model
 */
const JournalEntry = mongoose.model<IJournalEntry>('JournalEntry', journalEntrySchema);

export default JournalEntry; 
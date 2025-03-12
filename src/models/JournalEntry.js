const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Journal content is required']
  },
  // Automatically classified entry type (C.O.M.I.T)
  entryType: {
    type: String,
    enum: ['context', 'objectives', 'mindmap', 'ideate', 'track', 'unclassified'],
    default: 'unclassified'
  },
  // AI-extracted metadata
  metadata: {
    // For emotional analysis
    emotions: [{
      name: String,
      intensity: Number
    }],
    // For objectives and tasks
    goals: [{
      description: String,
      deadline: Date,
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'abandoned'],
        default: 'pending'
      }
    }],
    // For objectives and tasks
    tasks: [{
      description: String,
      deadline: Date,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'abandoned'],
        default: 'pending'
      },
      relatedGoal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Goal',
        default: null
      }
    }],
    // For tracking metrics
    metrics: [{
      name: String,
      value: mongoose.Schema.Types.Mixed,
      unit: String
    }],
    // For mindmapping and ideation
    themes: [String],
    // For knowledge graph connections
    relatedEntries: [{
      entryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JournalEntry'
      },
      relationStrength: {
        type: Number,
        min: 0,
        max: 1
      }
    }]
  },
  // Vector embedding for semantic search (stored as array of numbers)
  vectorEmbedding: {
    type: [Number],
    default: null
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for text search
JournalEntrySchema.index({ content: 'text', tags: 'text' });

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);

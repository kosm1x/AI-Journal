const JournalEntry = require('../models/JournalEntry');
const openai = require('../utils/openai');

/**
 * Map AI status values to valid schema enum values
 * @param {string} status - The status from AI
 * @returns {string} A valid status for the schema
 */
const mapStatusToValidEnum = (status) => {
  // Convert to lowercase and trim for consistent matching
  const normalizedStatus = (status || '').toLowerCase().trim();
  
  // Map various possible status values to our valid enum values
  if (normalizedStatus.includes('not') || normalizedStatus.includes('todo') || 
      normalizedStatus.includes('to-do') || normalizedStatus.includes('to do')) {
    return 'pending';
  } else if (normalizedStatus.includes('progress') || normalizedStatus.includes('ongoing') || 
             normalizedStatus.includes('started')) {
    return 'in-progress';
  } else if (normalizedStatus.includes('done') || normalizedStatus.includes('complete') || 
             normalizedStatus.includes('finished')) {
    return 'completed';
  } else if (normalizedStatus.includes('cancel') || normalizedStatus.includes('abandon') || 
             normalizedStatus.includes('drop')) {
    return 'abandoned';
  }
  
  // Default to pending if no match
  return 'pending';
};

/**
 * Create a new journal entry
 * @route POST /api/journal
 * @access Private
 */
const createEntry = async (req, res) => {
  try {
    const { content, entryType, tags } = req.body;
    
    // Create basic entry
    const entry = new JournalEntry({
      user: req.user.id,
      content,
      entryType: entryType || 'unclassified',
      tags: tags || []
    });

    // Analyze content with OpenAI if content is provided
    if (content) {
      try {
        // Get recent entries to find relationships
        const recentEntries = await JournalEntry.find({ 
          user: req.user.id 
        })
        .sort({ createdAt: -1 })
        .limit(20);
        
        console.log('Requesting AI analysis for journal entry...');
        const analysis = await openai.analyzeContent(content, recentEntries);
        console.log('AI analysis completed successfully');
        
        // Update entry with AI analysis
        if (!entryType) {
          entry.entryType = analysis.entryType || 'unclassified';
        }
        
        // Add emotions - handle both array of objects and array of strings formats
        if (analysis.emotions && analysis.emotions.length > 0) {
          if (typeof analysis.emotions[0] === 'string') {
            // Handle old format (array of strings)
            entry.metadata.emotions = analysis.emotions.map(emotion => ({
              name: emotion,
              intensity: 0.7 // Default intensity as a number
            }));
          } else {
            // Handle new format (array of objects with name and intensity)
            entry.metadata.emotions = analysis.emotions.map(emotion => ({
              name: emotion.name,
              // Convert string intensity to number if needed
              intensity: typeof emotion.intensity === 'string' 
                ? (emotion.intensity === 'high' ? 0.9 : emotion.intensity === 'medium' ? 0.6 : 0.3) 
                : emotion.intensity || 0.5
            }));
          }
        }
        
        // Add goals - handle both array of objects and array of strings formats
        if (analysis.goals && analysis.goals.length > 0) {
          if (typeof analysis.goals[0] === 'string') {
            // Handle old format (array of strings)
            entry.metadata.goals = analysis.goals.map(goal => ({
              description: goal,
              status: 'pending'
            }));
          } else {
            // Handle new format (array of objects with description and timeframe)
            entry.metadata.goals = analysis.goals.map(goal => ({
              description: goal.description,
              // Map status to valid enum values
              status: mapStatusToValidEnum(goal.status)
            }));
          }
        }
        
        // Add tasks - handle both array of objects and array of strings formats
        if (analysis.tasks && analysis.tasks.length > 0) {
          if (typeof analysis.tasks[0] === 'string') {
            // Handle old format (array of strings)
            entry.metadata.tasks = analysis.tasks.map(task => ({
              description: task,
              priority: 'medium',
              status: 'pending'
            }));
          } else {
            // Handle new format (array of objects with description and status)
            entry.metadata.tasks = analysis.tasks.map(task => ({
              description: task.description,
              // Map priority string to valid enum if needed
              priority: (task.priority || '').toLowerCase().includes('high') ? 'high' 
                     : (task.priority || '').toLowerCase().includes('low') ? 'low' 
                     : 'medium',
              // Map status to valid enum values
              status: mapStatusToValidEnum(task.status)
            }));
          }
        }
        
        // Add related entries if found
        if (analysis.relatedEntries && analysis.relatedEntries.length > 0) {
          entry.metadata.relatedEntries = analysis.relatedEntries;
        }
        
        // Add vector embedding for semantic search if generated
        if (analysis.vectorEmbedding) {
          entry.vectorEmbedding = analysis.vectorEmbedding;
        }
        
        // Add key concepts
        if (analysis.keyConcepts && analysis.keyConcepts.length > 0) {
          entry.metadata.themes = analysis.keyConcepts;
          
          // Add tags from key concepts if not already present
          analysis.keyConcepts.forEach(concept => {
            const conceptTag = concept.toLowerCase().replace(/\s+/g, '-');
            if (!entry.tags.includes(conceptTag)) {
              entry.tags.push(conceptTag);
            }
          });
        }
        
        // Add related concepts as additional tags
        if (analysis.relatedConcepts && analysis.relatedConcepts.length > 0) {
          // Add to tags if not already present
          analysis.relatedConcepts.forEach(concept => {
            const conceptTag = concept.toLowerCase().replace(/\s+/g, '-');
            if (!entry.tags.includes(conceptTag)) {
              entry.tags.push(conceptTag);
            }
          });
        }
        
        console.log('Entry updated with AI analysis');
      } catch (error) {
        console.error('Error during AI analysis:', error);
        // Continue without AI analysis if it fails
      }
    }

    // Save the entry
    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all journal entries for a user
 * @route GET /api/journal
 * @access Private
 */
const getEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ message: 'Error fetching journal entries', error: error.message });
  }
};

/**
 * Get a single journal entry
 * @route GET /api/journal/:id
 * @access Private
 */
const getEntryById = async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    
    // Check if the entry belongs to the user
    if (entry.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to access this entry' });
    }
    
    res.json(entry);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({ message: 'Error fetching journal entry', error: error.message });
  }
};

/**
 * Update a journal entry
 * @route PUT /api/journal/:id
 * @access Private
 */
const updateEntry = async (req, res) => {
  try {
    const { content, entryType, tags } = req.body;
    
    let entry = await JournalEntry.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    
    // Check if the entry belongs to the user
    if (entry.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this entry' });
    }
    
    // Update basic fields
    if (content !== undefined) entry.content = content;
    if (entryType !== undefined) entry.entryType = entryType;
    if (tags !== undefined) entry.tags = tags;
    
    // Re-analyze content with OpenAI if content has changed
    if (content && content !== entry.content) {
      try {
        const analysis = await openai.analyzeContent(content);
        
        // Update entry type if not manually specified
        if (!entryType) {
          entry.entryType = analysis.entryType || entry.entryType;
        }
        
        // Update emotions
        if (analysis.emotions && analysis.emotions.length > 0) {
          entry.metadata.emotions = analysis.emotions.map(emotion => ({
            name: emotion,
            intensity: 0.7 // Default intensity
          }));
        }
        
        // Update goals
        if (analysis.goals && analysis.goals.length > 0) {
          entry.metadata.goals = analysis.goals.map(goal => ({
            description: goal,
            status: 'pending'
          }));
        }
        
        // Update tasks
        if (analysis.tasks && analysis.tasks.length > 0) {
          entry.metadata.tasks = analysis.tasks.map(task => ({
            description: task,
            priority: 'medium',
            status: 'pending'
          }));
        }
        
        // Update themes
        if (analysis.keyConcepts && analysis.keyConcepts.length > 0) {
          entry.metadata.themes = analysis.keyConcepts;
        }
        
        // Add any additional tags identified
        if (analysis.keyConcepts && analysis.keyConcepts.length > 0) {
          const existingTags = new Set(entry.tags);
          analysis.keyConcepts.forEach(concept => {
            if (!existingTags.has(concept)) {
              entry.tags.push(concept);
            }
          });
        }
      } catch (error) {
        console.error('Error during AI analysis:', error);
        // Continue without AI analysis if it fails
      }
    }
    
    const updatedEntry = await entry.save();
    res.json(updatedEntry);
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(400).json({ message: 'Error updating journal entry', error: error.message });
  }
};

/**
 * Delete a journal entry
 * @route DELETE /api/journal/:id
 * @access Private
 */
const deleteEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    
    // Check if the entry belongs to the user
    if (entry.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this entry' });
    }
    
    await entry.deleteOne();
    res.json({ message: 'Journal entry removed' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ message: 'Error deleting journal entry', error: error.message });
  }
};

/**
 * Get weekly summary of journal entries
 * @route GET /api/journal/summary/weekly
 * @access Private
 */
const getWeeklySummary = async (req, res) => {
  try {
    console.log('Fetching weekly summary...');
    // Get entries from the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const entries = await JournalEntry.find({
      user: req.user.id,
      createdAt: { $gte: oneWeekAgo }
    }).sort({ createdAt: 1 });
    
    if (entries.length === 0) {
      return res.status(404).json({ message: 'No journal entries found for the past week' });
    }
    
    console.log(`Found ${entries.length} entries for weekly summary`);
    
    // Generate summary using OpenAI
    try {
      console.log('Requesting AI summary generation...');
      const summary = await openai.generateWeeklySummary(entries);
      console.log('AI summary generated successfully');
      res.json(summary);
    } catch (error) {
      console.error('Error generating weekly summary:', error);
      
      // Create a basic summary from the entries without AI
      const fallbackSummary = {
        summary: 'Unable to generate AI summary at this time.',
        insights: ['Review your entries manually to identify patterns and insights.'],
        emotionalTrends: ['Unable to analyze emotional trends without AI.'],
        accomplishments: ['Manual review of accomplishments required.'],
        challenges: ['AI summary generation is currently unavailable.'],
        recommendations: ['Try again later when the AI service is available.']
      };
      
      res.json({
        ...fallbackSummary,
        error: error.message,
        entries: entries.map(entry => ({
          id: entry._id,
          date: entry.createdAt,
          type: entry.entryType,
          content: entry.content.substring(0, 100) + '...',
          tags: entry.tags
        }))
      });
    }
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ message: 'Error fetching weekly summary', error: error.message });
  }
};

/**
 * Search journal entries by text
 * @route GET /api/journal/search
 * @access Private
 */
const searchEntries = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const entries = await JournalEntry.find({
      user: req.user.id,
      $text: { $search: query }
    }).sort({ score: { $meta: 'textScore' } });
    
    res.json(entries);
  } catch (error) {
    console.error('Error searching journal entries:', error);
    res.status(500).json({ message: 'Error searching journal entries', error: error.message });
  }
};

/**
 * Get entries by tag
 * @route GET /api/journal/tag/:tag
 * @access Private
 */
const getEntriesByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    
    const entries = await JournalEntry.find({
      user: req.user.id,
      tags: tag
    }).sort({ createdAt: -1 });
    
    res.json(entries);
  } catch (error) {
    console.error('Error fetching entries by tag:', error);
    res.status(500).json({ message: 'Error fetching entries by tag', error: error.message });
  }
};

/**
 * Get entries by type
 * @route GET /api/journal/type/:type
 * @access Private
 */
const getEntriesByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const entries = await JournalEntry.find({
      user: req.user.id,
      entryType: type
    }).sort({ createdAt: -1 });
    
    res.json(entries);
  } catch (error) {
    console.error('Error fetching entries by type:', error);
    res.status(500).json({ message: 'Error fetching entries by type', error: error.message });
  }
};

/**
 * Perform semantic search on journal entries
 * @route GET /api/journal/search/semantic
 * @access Private
 */
const semanticSearch = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    console.log(`Performing semantic search for: "${query}"`);
    
    // Generate embedding for the search query
    const queryEmbedding = await openai.generateEmbedding(query);
    
    if (!queryEmbedding) {
      return res.status(500).json({ message: 'Failed to generate embedding for search query' });
    }
    
    // Find all entries for the user
    const userEntries = await JournalEntry.find({ user: req.user.id });
    
    // Calculate similarity scores for entries with embeddings
    const results = [];
    
    for (const entry of userEntries) {
      let embedding = entry.vectorEmbedding;
      
      // Generate embedding if it doesn't exist
      if (!embedding || embedding.length === 0) {
        embedding = await openai.generateEmbedding(entry.content);
        
        // Save the embedding for future searches
        if (embedding) {
          entry.vectorEmbedding = embedding;
          await entry.save();
        }
      }
      
      if (embedding && embedding.length > 0) {
        // Calculate similarity between query and entry
        const similarity = calculateCosineSimilarity(queryEmbedding, embedding);
        
        if (similarity > 0.6) {  // Only include relevant results
          results.push({
            id: entry._id,
            content: entry.content.substring(0, 200) + '...',
            entryType: entry.entryType,
            createdAt: entry.createdAt,
            tags: entry.tags,
            relevanceScore: Math.round(similarity * 100) / 100
          });
        }
      }
    }
    
    // Sort by relevance and limit to top 10
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const topResults = results.slice(0, 10);
    
    res.json({
      results: topResults,
      count: topResults.length,
      query
    });
  } catch (error) {
    console.error('Error during semantic search:', error);
    res.status(500).json({ message: 'Error during semantic search', error: error.message });
  }
};

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} vecA - First vector
 * @param {Array} vecB - Second vector
 * @returns {number} Cosine similarity score (0-1)
 */
const calculateCosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

module.exports = {
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  getWeeklySummary,
  searchEntries,
  getEntriesByTag,
  getEntriesByType,
  semanticSearch
};

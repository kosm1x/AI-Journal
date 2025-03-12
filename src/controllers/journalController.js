const JournalEntry = require('../models/JournalEntry');

/**
 * Create a new journal entry
 * @route POST /api/journal
 * @access Private
 */
const createEntry = async (req, res) => {
  try {
    const { content, entryType, tags } = req.body;

    // Create new journal entry
    const entry = await JournalEntry.create({
      user: req.user._id,
      content,
      entryType: entryType || 'unclassified',
      tags: tags || []
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all journal entries for a user
 * @route GET /api/journal
 * @access Private
 */
const getEntries = async (req, res) => {
  try {
    // Extract query parameters
    const { 
      page = 1, 
      limit = 10, 
      entryType, 
      startDate, 
      endDate,
      search
    } = req.query;

    // Build query
    const query = { user: req.user._id };

    // Add entry type filter if provided
    if (entryType) {
      query.entryType = entryType;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Add text search if provided
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const entries = await JournalEntry.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const count = await JournalEntry.countDocuments(query);

    res.json({
      entries,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a single journal entry by ID
 * @route GET /api/journal/:id
 * @access Private
 */
const getEntryById = async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);

    // Check if entry exists
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Check if user owns the entry
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to access this entry' });
    }

    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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

    // Find entry by ID
    let entry = await JournalEntry.findById(req.params.id);

    // Check if entry exists
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Check if user owns the entry
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this entry' });
    }

    // Update entry fields
    entry.content = content || entry.content;
    if (entryType) entry.entryType = entryType;
    if (tags) entry.tags = tags;

    // Save updated entry
    entry = await entry.save();

    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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

    // Check if entry exists
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Check if user owns the entry
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this entry' });
    }

    // Remove entry
    await entry.deleteOne();

    res.json({ message: 'Entry removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get weekly summary of journal entries
 * @route GET /api/journal/summary/weekly
 * @access Private
 */
const getWeeklySummary = async (req, res) => {
  try {
    // Calculate date range for the past week
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Get entries for the past week
    const entries = await JournalEntry.find({
      user: req.user._id,
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });

    // Count entries by type
    const entryCounts = {
      context: 0,
      objectives: 0,
      mindmap: 0,
      ideate: 0,
      track: 0,
      unclassified: 0
    };

    entries.forEach(entry => {
      entryCounts[entry.entryType]++;
    });

    // Calculate total entries
    const totalEntries = entries.length;

    // Get most active day
    const dailyCounts = {};
    entries.forEach(entry => {
      const day = entry.createdAt.toISOString().split('T')[0];
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });

    let mostActiveDay = null;
    let maxCount = 0;
    
    for (const [day, count] of Object.entries(dailyCounts)) {
      if (count > maxCount) {
        mostActiveDay = day;
        maxCount = count;
      }
    }

    res.json({
      totalEntries,
      entryCounts,
      mostActiveDay,
      startDate,
      endDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  getWeeklySummary
};

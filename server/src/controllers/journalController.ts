import { Request, Response, NextFunction } from 'express';
import JournalEntry from '../models/JournalEntry';
import { ApiError } from '../middleware/errorHandler';

/**
 * Create a new journal entry
 * @route POST /api/journal
 * @access Private
 */
export const createJournalEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Add user ID to request body
    req.body.user = req.user?.id;
    
    // Create journal entry
    const journalEntry = await JournalEntry.create(req.body);
    
    // Send response
    res.status(201).json({
      success: true,
      data: journalEntry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all journal entries for the current user
 * @route GET /api/journal
 * @access Private
 */
export const getJournalEntries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get journal entries for current user
    const journalEntries = await JournalEntry.find({ user: req.user?.id })
      .sort({ date: -1 });
    
    // Send response
    res.status(200).json({
      success: true,
      count: journalEntries.length,
      data: journalEntries,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single journal entry
 * @route GET /api/journal/:id
 * @access Private
 */
export const getJournalEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get journal entry
    const journalEntry = await JournalEntry.findById(req.params.id);
    
    // Check if journal entry exists
    if (!journalEntry) {
      throw new ApiError(404, 'Journal entry not found');
    }
    
    // Check if user owns the journal entry
    if (journalEntry.user.toString() !== req.user?.id) {
      throw new ApiError(403, 'Not authorized to access this journal entry');
    }
    
    // Send response
    res.status(200).json({
      success: true,
      data: journalEntry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a journal entry
 * @route PUT /api/journal/:id
 * @access Private
 */
export const updateJournalEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Find journal entry
    let journalEntry = await JournalEntry.findById(req.params.id);
    
    // Check if journal entry exists
    if (!journalEntry) {
      throw new ApiError(404, 'Journal entry not found');
    }
    
    // Check if user owns the journal entry
    if (journalEntry.user.toString() !== req.user?.id) {
      throw new ApiError(403, 'Not authorized to update this journal entry');
    }
    
    // Update journal entry
    journalEntry = await JournalEntry.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    
    // Send response
    res.status(200).json({
      success: true,
      data: journalEntry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a journal entry
 * @route DELETE /api/journal/:id
 * @access Private
 */
export const deleteJournalEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Find journal entry
    const journalEntry = await JournalEntry.findById(req.params.id);
    
    // Check if journal entry exists
    if (!journalEntry) {
      throw new ApiError(404, 'Journal entry not found');
    }
    
    // Check if user owns the journal entry
    if (journalEntry.user.toString() !== req.user?.id) {
      throw new ApiError(403, 'Not authorized to delete this journal entry');
    }
    
    // Delete journal entry
    await journalEntry.deleteOne();
    
    // Send response
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
}; 
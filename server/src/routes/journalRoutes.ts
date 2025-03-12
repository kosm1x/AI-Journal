import express from 'express';
import {
  createJournalEntry,
  getJournalEntries,
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from '../controllers/journalController';
import authenticate from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(authenticate);

// Journal entry routes
router.route('/')
  .get(getJournalEntries)
  .post(createJournalEntry);

router.route('/:id')
  .get(getJournalEntry)
  .put(updateJournalEntry)
  .delete(deleteJournalEntry);

export default router; 
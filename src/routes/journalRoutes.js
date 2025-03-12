const express = require('express');
const router = express.Router();
const { 
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  getWeeklySummary
} = require('../controllers/journalController');
const { protect } = require('../middleware/auth');

// All journal routes are protected
router.use(protect);

// Journal entry routes
router.route('/')
  .post(createEntry)
  .get(getEntries);

router.route('/:id')
  .get(getEntryById)
  .put(updateEntry)
  .delete(deleteEntry);

// Summary routes
router.get('/summary/weekly', getWeeklySummary);

module.exports = router;

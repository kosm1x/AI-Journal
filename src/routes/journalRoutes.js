const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/journalController');
const { protect } = require('../middleware/auth');

// All journal routes are protected
router.use(protect);

// Search routes (must be before /:id to avoid conflict)
router.get('/search', searchEntries);
router.get('/search/semantic', semanticSearch);

// Tag and type routes
router.get('/tag/:tag', getEntriesByTag);
router.get('/type/:type', getEntriesByType);

// Summary routes
router.get('/summary/weekly', getWeeklySummary);

// Journal entry routes
router.route('/')
  .post(createEntry)
  .get(getEntries);

router.route('/:id')
  .get(getEntryById)
  .put(updateEntry)
  .delete(deleteEntry);

module.exports = router;

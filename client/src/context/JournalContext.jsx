import { createContext, useState, useContext, useCallback, useEffect } from 'react';
import apiService from '../utils/api';

// Create journal context
const JournalContext = createContext();

// Custom hook for using journal context
export const useJournal = () => useContext(JournalContext);

// Journal provider component
export const JournalProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cache entries in localStorage when they change
  useEffect(() => {
    if (entries.length > 0) {
      try {
        // Store up to 20 recent entries for local search fallback
        localStorage.setItem('recentEntries', JSON.stringify(entries.slice(0, 20)));
      } catch (err) {
        console.warn('Failed to cache entries in localStorage:', err);
      }
    }
  }, [entries]);

  // Fetch all entries with caching
  const fetchEntries = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getEntries(params);
      setEntries(response.data);
      
      // Cache entries for offline use
      try {
        localStorage.setItem('cachedEntries', JSON.stringify(response.data));
        // Also update recent entries cache
        localStorage.setItem('recentEntries', JSON.stringify(response.data.slice(0, 20)));
      } catch (cacheErr) {
        console.warn('Failed to cache entries:', cacheErr);
      }
      
      return response.data;
    } catch (err) {
      // Handle timeout errors gracefully
      if (err.isTimeout) {
        setError('Loading timed out. Using cached data if available.');
      } else {
        setError(err.message || 'Failed to fetch entries');
      }
      
      // Try to use cached data
      try {
        const cachedData = localStorage.getItem('cachedEntries');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          setEntries(parsed);
          return parsed;
        }
      } catch (cacheErr) {
        console.error('Failed to load cached entries:', cacheErr);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch entry by ID with caching and fallback
  const fetchEntryById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getEntryById(id);
      setCurrentEntry(response.data);
      
      // Cache this entry for fallback
      try {
        const cacheKey = `entry_${id}`;
        localStorage.setItem(cacheKey, JSON.stringify(response.data));
      } catch (cacheErr) {
        console.warn('Failed to cache entry:', cacheErr);
      }
      
      return response.data;
    } catch (err) {
      // Handle different error types
      if (err.isTimeout) {
        setError('Loading timed out. Using cached data if available.');
      } else if (err.isServerError) {
        setError('Server error. Using cached data if available.');
      } else {
        setError(err.message || 'Failed to fetch entry');
      }
      
      // Try to use cached data for this specific entry
      try {
        const cacheKey = `entry_${id}`;
        const cachedEntry = localStorage.getItem(cacheKey);
        if (cachedEntry) {
          const parsed = JSON.parse(cachedEntry);
          setCurrentEntry(parsed);
          return parsed;
        }
        
        // If no specific cache, check if it's in the entries list
        const cachedEntries = localStorage.getItem('cachedEntries');
        if (cachedEntries) {
          const entries = JSON.parse(cachedEntries);
          const entry = entries.find(e => e._id === id);
          if (entry) {
            setCurrentEntry(entry);
            return entry;
          }
        }
      } catch (cacheErr) {
        console.error('Failed to load cached entry:', cacheErr);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new entry
  const createEntry = useCallback(async (entryData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.createEntry(entryData);
      setEntries(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to create entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update entry
  const updateEntry = useCallback(async (id, entryData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.updateEntry(id, entryData);
      setEntries(prev => 
        prev.map(entry => entry._id === id ? response.data : entry)
      );
      if (currentEntry?._id === id) {
        setCurrentEntry(response.data);
      }
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to update entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentEntry]);

  // Delete entry
  const deleteEntry = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.deleteEntry(id);
      setEntries(prev => prev.filter(entry => entry._id !== id));
      if (currentEntry?._id === id) {
        setCurrentEntry(null);
      }
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentEntry]);

  // Search entries
  const searchEntries = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.searchEntries(query);
      return response.data;
    } catch (err) {
      setError(err.message || 'Search failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Semantic search with local caching and timeout handling
  const semanticSearch = useCallback(async (query) => {
    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return [];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // First try to get results from local cache
      const cacheKey = `semantic_search_${query.trim().toLowerCase()}`;
      const cachedResults = localStorage.getItem(cacheKey);
      
      if (cachedResults) {
        try {
          const parsed = JSON.parse(cachedResults);
          console.log('Using cached semantic search results');
          return parsed;
        } catch (e) {
          console.warn('Failed to parse cached results');
          // Continue with API call if cache parsing fails
        }
      }
      
      // Set a shorter timeout for semantic search to avoid long waits
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      try {
        // Make API call with abort controller
        const response = await apiService.semanticSearch(query, { signal: controller.signal });
        
        // Cache successful results
        if (response.data && Array.isArray(response.data)) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(response.data));
          } catch (e) {
            console.warn('Failed to cache search results');
          }
        }
        
        return response.data || [];
      } catch (err) {
        if (err.name === 'AbortError' || err.message.includes('timeout')) {
          console.warn('Semantic search timed out, using fallback');
          return performLocalSearch(query);
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err) {
      console.warn('Semantic search failed:', err.message);
      setError('Semantic search unavailable');
      return performLocalSearch(query);
    } finally {
      setLoading(false);
    }
  }, []);

  // Local search fallback function
  const performLocalSearch = useCallback((query) => {
    try {
      const cachedEntries = localStorage.getItem('recentEntries');
      if (!cachedEntries) return [];
      
      const entries = JSON.parse(cachedEntries);
      if (!Array.isArray(entries)) return [];
      
      // Simple text matching as fallback
      const results = entries.filter(entry => 
        entry.content && entry.content.toLowerCase().includes(query.toLowerCase())
      );
      
      console.log(`Local search found ${results.length} results`);
      return results.slice(0, 5);
    } catch (err) {
      console.error('Local search failed:', err);
      return [];
    }
  }, []);

  // Get weekly summary
  const getWeeklySummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getWeeklySummary();
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to get weekly summary');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Context value
  const value = {
    entries,
    currentEntry,
    loading,
    error,
    fetchEntries,
    fetchEntryById,
    createEntry,
    updateEntry,
    deleteEntry,
    searchEntries,
    semanticSearch,
    getWeeklySummary
  };

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
};

export default JournalContext;

import axios from 'axios';

// Use port 5004 to match the .env configuration
const API_URL = 'http://localhost:5004/api';

// Create axios instance with base URL and timeout
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout (reduced from 15s)
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log abort errors as they're intentional timeouts
    if (error.name === 'CanceledError' || error.name === 'AbortError') {
      return Promise.reject({
        message: 'Request canceled',
        status: 0,
        isCanceled: true
      });
    }
    
    // Handle timeout errors gracefully
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.warn('API request timed out:', error.config?.url);
      return Promise.reject({
        message: 'Request timed out',
        status: 0,
        isTimeout: true
      });
    }
    
    // Handle server errors (500) specially
    if (error.response?.status === 500) {
      console.warn('Server error (500):', error.config?.url);
      return Promise.reject({
        message: error.response?.data?.message || 'Server error',
        status: 500,
        isServerError: true
      });
    }
    
    // Log other errors for debugging
    console.error('API Error:', error.message);
    
    // Return a friendly error object
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'Network error',
      status: error.response?.status || 0,
      isNetworkError: !error.response && error.code === 'ERR_NETWORK',
      isCanceled: error.name === 'CanceledError' || error.name === 'AbortError',
      isTimeout: error.code === 'ECONNABORTED' || error.message.includes('timeout'),
      isServerError: error.response?.status === 500
    });
  }
);

// Helper function to make API calls with retry logic
const callWithRetry = async (apiCall, retries = 1) => {
  try {
    return await apiCall();
  } catch (error) {
    if (retries > 0 && (error.isNetworkError || error.isTimeout)) {
      console.log(`Retrying API call, ${retries} attempts left`);
      return callWithRetry(apiCall, retries - 1);
    }
    throw error;
  }
};

// API service functions with enhanced error handling
const apiService = {
  // Auth endpoints
  login: (credentials) => callWithRetry(() => api.post('/users/login', credentials)),
  register: (userData) => callWithRetry(() => api.post('/users/register', userData)),
  
  // Journal entries endpoints with fallbacks
  getEntries: async (params) => {
    try {
      return await callWithRetry(() => api.get('/journal', { params }));
    } catch (error) {
      // For critical data, try to return cached data on failure
      if (error.isNetworkError || error.isTimeout) {
        const cachedEntries = localStorage.getItem('cachedEntries');
        if (cachedEntries) {
          console.log('Using cached entries due to API failure');
          return { data: JSON.parse(cachedEntries) };
        }
      }
      throw error;
    }
  },
  
  getEntryById: (id) => callWithRetry(() => api.get(`/journal/${id}`)),
  createEntry: (entry) => callWithRetry(() => api.post('/journal', entry)),
  updateEntry: (id, entry) => callWithRetry(() => api.put(`/journal/${id}`, entry)),
  deleteEntry: (id) => callWithRetry(() => api.delete(`/journal/${id}`)),
  
  // Search and filtering
  searchEntries: (query) => callWithRetry(() => api.get('/journal/search', { params: { query } })),
  
  // Semantic search with retry and local fallback
  semanticSearch: async (query, options = {}) => {
    try {
      // Try API call with one retry and the provided options (like abort signal)
      return await callWithRetry(() => api.get('/journal/search/semantic', { 
        params: { query },
        ...options
      }), 1);
    } catch (error) {
      console.warn('Semantic search API failed, using local fallback');
      
      // If we have entries in localStorage, use them for basic local search
      try {
        const cachedEntries = localStorage.getItem('recentEntries');
        if (cachedEntries) {
          const entries = JSON.parse(cachedEntries);
          
          // Simple text matching as fallback
          const results = entries.filter(entry => 
            entry.content && entry.content.toLowerCase().includes(query.toLowerCase())
          );
          
          return { data: results.slice(0, 5) };
        }
      } catch (localError) {
        console.error('Local fallback failed:', localError);
      }
      
      // Return empty result if all else fails
      return { data: [] };
    }
  },
  
  getEntriesByTag: (tag) => callWithRetry(() => api.get(`/journal/tag/${tag}`)),
  getEntriesByType: (type) => callWithRetry(() => api.get(`/journal/type/${type}`)),
  
  // Summary and analysis
  getWeeklySummary: () => callWithRetry(() => api.get('/journal/summary/weekly'))
};

export default apiService;

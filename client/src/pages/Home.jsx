import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { useAuth } from '../context/AuthContext';
import EntryCard from '../components/EntryCard';

const Home = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { entries, fetchEntries, getWeeklySummary } = useJournal();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Load entries on component mount
  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true);
      try {
        await fetchEntries();
      } catch (error) {
        // Handle errors gracefully - the fetchEntries function already tries to use cached data
        if (error.isTimeout) {
          console.log('Loading timed out, using cached data');
        } else if (error.isNetworkError) {
          console.log('Network error, using cached data');
        } else {
          console.error('Error loading data:', error);
          setError(error.message || 'Failed to load entries');
        }
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [fetchEntries]);
  
  // Load entries and summary data
  const loadData = async () => {
    try {
      const summaryData = await getWeeklySummary();
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  
  // Handle filter change
  const handleFilterChange = async (newFilter) => {
    setFilter(newFilter);
    
    try {
      if (newFilter === 'all') {
        await fetchEntries();
      } else {
        await fetchEntries({ entryType: newFilter });
      }
    } catch (error) {
      console.error('Error filtering entries:', error);
    }
  };
  
  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return loadData();
    }
    
    try {
      await fetchEntries({ search: searchQuery });
    } catch (error) {
      console.error('Error searching entries:', error);
    }
  };
  
  // Create new entry
  const handleNewEntry = () => {
    navigate('/entries/new');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">COMMIT Journal</h1>
        <button
          onClick={handleNewEntry}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          New Entry
        </button>
      </div>
      
      {/* Weekly summary card */}
      {summary && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Weekly Summary</h2>
          <p className="text-gray-700 mb-4">{summary.content}</p>
          
          {summary.insights && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Key Insights</h3>
              <ul className="list-disc list-inside text-gray-700">
                {summary.insights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Search and filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 w-full md:w-auto">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('context')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'context' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            Context
          </button>
          <button
            onClick={() => handleFilterChange('objectives')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'objectives' 
                ? 'bg-green-600 text-white' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            Objectives
          </button>
          <button
            onClick={() => handleFilterChange('mindmap')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'mindmap' 
                ? 'bg-purple-600 text-white' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            Mindmap
          </button>
          <button
            onClick={() => handleFilterChange('ideate')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'ideate' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            Ideate
          </button>
          <button
            onClick={() => handleFilterChange('track')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'track' 
                ? 'bg-red-600 text-white' 
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            Track
          </button>
        </div>
        
        <form onSubmit={handleSearch} className="w-full md:w-64">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              🔍
            </button>
          </div>
        </form>
      </div>
      
      {/* Entries list */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading entries...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={handleNewEntry}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Create Your First Entry
            </button>
          </div>
        ) : entries.length > 0 ? (
          entries.map(entry => (
            <EntryCard key={entry._id} entry={entry} />
          ))
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No journal entries found</p>
            <button
              onClick={handleNewEntry}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Create Your First Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

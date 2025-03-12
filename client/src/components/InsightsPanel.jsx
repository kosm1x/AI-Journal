import { useState, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const InsightsPanel = ({ entry }) => {
  const [loading, setLoading] = useState(false);
  const [relatedEntries, setRelatedEntries] = useState([]);
  const [relatedError, setRelatedError] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { semanticSearch } = useJournal();
  
  // Fetch related entries when entry changes
  useEffect(() => {
    if (entry?._id) {
      fetchRelatedEntries();
    }
  }, [entry]);

  // Fetch related entries based on current entry
  const fetchRelatedEntries = async () => {
    if (!entry?.content || entry.content.trim().length < 10) {
      return;
    }
    
    setLoading(true);
    setRelatedError(null);
    
    try {
      // Extract a snippet from the content for search
      const snippet = entry.content.substring(0, 100);
      console.log(`Performing semantic search for: "${snippet}"`);
      
      // Use our handleSemanticSearch function
      await handleSemanticSearch(snippet);
    } catch (error) {
      console.error('Error fetching related entries:', error);
      setRelatedError('Failed to load related entries');
    } finally {
      setLoading(false);
    }
  };
  
  // Semantic search function
  const handleSemanticSearch = async (query) => {
    if (!query || query.trim().length < 3) {
      setSearchError('Please enter at least 3 characters');
      return;
    }
    
    setSearching(true);
    setSearchError(null);
    
    try {
      console.log(`Performing semantic search for: "${query}"`);
      const results = await semanticSearch(query);
      
      if (results && Array.isArray(results)) {
        setRelatedEntries(results);
        if (results.length === 0) {
          setSearchError('No related entries found');
        }
      } else {
        // Fallback to local search if semantic search returns invalid data
        performLocalSearch(query);
      }
    } catch (error) {
      // Don't show errors for canceled requests - they're expected
      if (error.isCanceled) {
        console.log('Search request canceled (timeout) - using fallback');
      } else {
        console.error('Semantic search error:', error);
        setSearchError('Search failed. Using local results instead.');
      }
      
      // Fallback to local search
      performLocalSearch(query);
    } finally {
      setSearching(false);
    }
  };
  
  // Local search fallback
  const performLocalSearch = (query) => {
    try {
      // Get cached entries from localStorage
      const cachedEntries = localStorage.getItem('recentEntries');
      if (cachedEntries) {
        const entries = JSON.parse(cachedEntries);
        
        // Simple text matching as fallback
        const results = entries.filter(entry => 
          entry.content && entry.content.toLowerCase().includes(query.toLowerCase())
        );
        
        setRelatedEntries(results.slice(0, 5));
        if (results.length === 0) {
          setSearchError('No related entries found in local cache');
        }
      } else {
        setSearchError('No cached entries available for local search');
      }
    } catch (localError) {
      console.error('Local search fallback failed:', localError);
      setSearchError('Search failed completely');
    }
  };
  
  // Prepare emotion data for chart
  const prepareEmotionData = () => {
    if (!entry?.metadata?.emotions || entry.metadata.emotions.length === 0) {
      return null;
    }
    
    const emotions = entry.metadata.emotions;
    const labels = emotions.map(e => e.name);
    const data = emotions.map(e => e.intensity || 1);
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Prepare goal status data for chart
  const prepareGoalData = () => {
    if (!entry?.metadata?.goals || entry.metadata.goals.length === 0) {
      return null;
    }
    
    // Count goals by status
    const statusCounts = entry.metadata.goals.reduce((acc, goal) => {
      const status = goal.status || 'unspecified';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: 'Goal Status',
          data: Object.values(statusCounts),
          backgroundColor: [
            '#4BC0C0',
            '#FF6384',
            '#FFCE56',
            '#36A2EB',
            '#9966FF'
          ]
        }
      ]
    };
  };
  
  // Emotion chart options
  const emotionChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Emotions'
      }
    }
  };
  
  // Goal chart options
  const goalChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Goal Status'
      }
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Prepare emotion data
  const emotionData = prepareEmotionData();
  
  // Prepare goal data
  const goalData = prepareGoalData();
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Entry Insights</h3>
      
      {/* Entry metadata */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Created:</span> {formatDate(entry?.createdAt)}
          </div>
          <div>
            <span className="font-medium">Type:</span> {entry?.entryType || 'Unclassified'}
          </div>
          <div>
            <span className="font-medium">Word Count:</span> {entry?.content?.split(/\s+/).length || 0}
          </div>
          <div>
            <span className="font-medium">Tags:</span> {entry?.tags?.join(', ') || 'None'}
          </div>
        </div>
      </div>
      
      {/* Charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Emotion chart */}
        {emotionData ? (
          <div>
            <Pie data={emotionData} options={emotionChartOptions} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded">
            <p className="text-gray-500 text-sm">No emotion data available</p>
          </div>
        )}
        
        {/* Goal status chart */}
        {goalData ? (
          <div>
            <Bar data={goalData} options={goalChartOptions} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded">
            <p className="text-gray-500 text-sm">No goal data available</p>
          </div>
        )}
      </div>
      
      {/* Related entries section */}
      <div>
        <h4 className="font-medium mb-2">Related Entries</h4>
        
        {/* Add search input */}
        <div className="mb-3 flex">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded px-2 py-1 text-sm flex-grow"
            onKeyDown={(e) => e.key === 'Enter' && handleSemanticSearch(searchQuery)}
          />
          <button 
            onClick={() => handleSemanticSearch(searchQuery)}
            className="ml-2 bg-blue-500 text-white px-2 py-1 rounded text-sm"
            disabled={searching}
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {searching ? (
          <p className="text-gray-500 text-sm">Loading related entries...</p>
        ) : searchError ? (
          <p className="text-red-500 text-sm">{searchError}</p>
        ) : relatedEntries.length > 0 ? (
          <ul className="space-y-2">
            {relatedEntries.map(entry => (
              <li key={entry._id} className="border-l-2 border-primary-500 pl-3 py-1">
                <a 
                  href={`/entries/${entry._id}`}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  {entry.entryType && (
                    <span className="text-xs bg-gray-100 px-1 py-0.5 rounded mr-2">
                      {entry.entryType}
                    </span>
                  )}
                  {entry.content?.substring(0, 60) || 'No content'}...
                </a>
                <div className="text-xs text-gray-500">
                  {formatDate(entry.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No related entries found</p>
        )}
      </div>
    </div>
  );
};

export default InsightsPanel;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import InsightsPanel from '../components/InsightsPanel';

const EntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchEntryById, deleteEntry, loading, error } = useJournal();
  const [entry, setEntry] = useState(null);
  const [localError, setLocalError] = useState(null);
  
  // Fetch entry on component mount
  useEffect(() => {
    if (id) {
      loadEntry();
    }
  }, [id]);
  
  // Load entry data with error handling
  const loadEntry = async () => {
    setLocalError(null);
    try {
      const data = await fetchEntryById(id);
      setEntry(data);
    } catch (err) {
      console.error('Error loading entry:', err);
      setLocalError(err.message || 'Failed to load entry');
      
      // Try to load from cache if available
      try {
        const cacheKey = `entry_${id}`;
        const cachedEntry = localStorage.getItem(cacheKey);
        if (cachedEntry) {
          console.log('Using cached entry data');
          setEntry(JSON.parse(cachedEntry));
        }
      } catch (cacheErr) {
        console.error('Failed to load from cache:', cacheErr);
      }
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle edit entry
  const handleEdit = () => {
    navigate(`/entries/edit/${id}`);
  };
  
  // Handle delete entry
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(id);
        navigate('/');
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading entry...</p>
        </div>
      ) : (error || localError) && !entry ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700 mb-2">Error: {error || localError}</p>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Back to Home
            </button>
            <button
              onClick={loadEntry}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : !entry ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Entry not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">{entry.title}</h1>
                <p className="text-gray-500">{formatDate(entry.createdAt)}</p>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="prose max-w-none">
              {entry.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          
          {/* Insights panel */}
          <div className="md:col-span-1">
            <InsightsPanel entry={entry} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryDetail;

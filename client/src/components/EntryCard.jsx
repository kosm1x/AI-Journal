import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Component for displaying a journal entry card
const EntryCard = ({ entry }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get entry type badge color
  const getTypeColor = (type) => {
    const colors = {
      context: 'bg-blue-100 text-blue-800',
      objectives: 'bg-green-100 text-green-800',
      mindmap: 'bg-purple-100 text-purple-800',
      ideate: 'bg-yellow-100 text-yellow-800',
      track: 'bg-red-100 text-red-800',
      unclassified: 'bg-gray-100 text-gray-800'
    };
    return colors[type?.toLowerCase()] || colors.unclassified;
  };
  
  // Truncate content for preview
  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };
  
  // Handle click to view full entry
  const handleViewEntry = () => {
    navigate(`/entries/${entry._id}`);
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={expanded ? null : handleViewEntry}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(entry.entryType)}`}>
            {entry.entryType || 'Unclassified'}
          </span>
          <span className="text-sm text-gray-500 ml-2">
            {formatDate(entry.createdAt)}
          </span>
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      <div className={expanded ? '' : 'line-clamp-3'}>
        {expanded ? entry.content : truncateContent(entry.content)}
      </div>
      
      {expanded && (
        <div className="mt-4">
          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Emotions */}
          {entry.metadata?.emotions && entry.metadata.emotions.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-semibold mb-1">Emotions:</h4>
              <div className="flex flex-wrap gap-1">
                {entry.metadata.emotions.map((emotion, index) => (
                  <span 
                    key={index}
                    className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full"
                    title={`Intensity: ${emotion.intensity || 'N/A'}`}
                  >
                    {emotion.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Goals */}
          {entry.metadata?.goals && entry.metadata.goals.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-semibold mb-1">Goals:</h4>
              <ul className="text-sm list-disc list-inside">
                {entry.metadata.goals.map((goal, index) => (
                  <li key={index} className="mb-1">
                    {goal.description}
                    <span className="ml-2 text-xs text-gray-500">
                      Status: {goal.status || 'N/A'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* View full button */}
          <button
            onClick={handleViewEntry}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            View Full Entry
          </button>
        </div>
      )}
    </div>
  );
};

export default EntryCard;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import Editor from '../components/Editor';

const EntryEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchEntryById, createEntry, updateEntry, loading } = useJournal();
  const [entry, setEntry] = useState(null);
  const [initialContent, setInitialContent] = useState('');
  
  // Check if editing existing entry
  const isEditing = id !== 'new';
  
  // Fetch entry data if editing
  useEffect(() => {
    if (isEditing) {
      loadEntry();
    }
  }, [id, isEditing]);
  
  // Load entry data
  const loadEntry = async () => {
    try {
      const data = await fetchEntryById(id);
      setEntry(data);
      setInitialContent(data.content || '');
    } catch (error) {
      console.error('Error loading entry:', error);
    }
  };
  
  // Handle save entry
  const handleSave = async (savedEntry) => {
    navigate(`/entries/${savedEntry._id}`);
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (isEditing) {
      navigate(`/entries/${id}`);
    } else {
      navigate('/');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Edit Entry' : 'New Entry'}
        </h1>
        <button
          onClick={handleCancel}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 min-h-[70vh]">
        {loading && isEditing ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading entry...</p>
          </div>
        ) : (
          <Editor
            initialContent={initialContent}
            entryId={isEditing ? id : null}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
};

export default EntryEditor;

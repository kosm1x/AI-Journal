import { useState, useEffect, useRef } from 'react';
import { useJournal } from '../context/JournalContext';

const Editor = ({ initialContent = '', entryId = null, onSave }) => {
  const [content, setContent] = useState(initialContent);
  const [entryType, setEntryType] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const editorRef = useRef(null);
  const { createEntry, updateEntry } = useJournal();

  // COMMIT framework entry types
  const entryTypes = [
    { value: 'context', label: 'Context', description: 'Capture your current situation and environment' },
    { value: 'objectives', label: 'Objectives', description: 'Define your goals and what you want to achieve' },
    { value: 'mindmap', label: 'Mindmap', description: 'Explore connections between ideas and concepts' },
    { value: 'ideate', label: 'Ideate', description: 'Brainstorm solutions and creative ideas' },
    { value: 'track', label: 'Track', description: 'Monitor progress and reflect on outcomes' }
  ];

  // Initialize with existing entry data if available
  useEffect(() => {
    setContent(initialContent);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, [initialContent]);

  // Auto-save functionality
  useEffect(() => {
    if (content.trim() && content !== initialContent) {
      // Clear existing timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      // Set new timer for auto-save
      const timer = setTimeout(() => {
        handleSave();
      }, 5000); // Auto-save after 5 seconds of inactivity
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [content]);

  // Handle content change
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  // Handle entry type change
  const handleTypeChange = (e) => {
    setEntryType(e.target.value);
  };

  // Save entry
  const handleSave = async () => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    
    try {
      const entryData = {
        content,
        entryType: entryType || undefined
      };
      
      let savedEntry;
      
      if (entryId) {
        // Update existing entry
        savedEntry = await updateEntry(entryId, entryData);
      } else {
        // Create new entry
        savedEntry = await createEntry(entryData);
      }
      
      if (onSave) {
        onSave(savedEntry);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Entry type selector */}
      <div className="mb-4">
        <select
          value={entryType}
          onChange={handleTypeChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="">Auto-detect entry type</option>
          {entryTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label} - {type.description}
            </option>
          ))}
        </select>
      </div>
      
      {/* Distraction-free editor */}
      <div className="flex-grow relative">
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          className="w-full h-full p-4 text-lg border-0 focus:ring-0 focus:outline-none resize-none"
          placeholder="Start writing your journal entry here..."
        />
      </div>
      
      {/* Status and save button */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          {isSaving ? 'Saving...' : 'Auto-save enabled'}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || !content.trim()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Now'}
        </button>
      </div>
    </div>
  );
};

export default Editor;

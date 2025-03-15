import React, { useState } from 'react';
import { importFeedbackData, generateAnalytics } from '../utils/importData';

const FeedbackImporter = ({ onDataImported, onDataProcessed }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Only accept JSON files
      if (!file.name.endsWith('.json')) {
        throw new Error('Please upload a JSON file');
      }
      
      const importedData = await importFeedbackData(file);
      onDataImported(importedData);
      
      if (onDataProcessed) {
        const analyticsData = generateAnalytics(
          importedData.feedback,
          importedData.themeMap || {},
          importedData.sentimentMap || {}
        );
        
        onDataProcessed({
          nodes: importedData.nodes,
          links: importedData.links,
          insights: {},
          analytics: analyticsData
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error importing file:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-3">Import Feedback Data</h2>
      
      <div className="flex items-center space-x-4">
        <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Select JSON File
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            onChange={handleFileUpload} 
            disabled={isLoading}
          />
        </label>
        
        {isLoading && <span className="text-gray-600">Processing...</span>}
      </div>
      
      {error && (
        <div className="mt-3 text-red-500">
          Error: {error}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Expected format: JSON array of feedback objects with id, text, user_role, and timestamp fields.</p>
      </div>
    </div>
  );
};

export default FeedbackImporter; 
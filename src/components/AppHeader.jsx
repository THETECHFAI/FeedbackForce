import React from 'react';
import { Link } from 'react-router-dom';

const AppHeader = ({ 
  searchTerm, 
  setSearchTerm, 
  showSearchResults, 
  searchResults, 
  setSearchResults,
  setSelectedNode, 
  handleNodeClick, 
  setShowSearchResults,
  graphData,
  hideSearch = false
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      {/* Main navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {/* Feedback Force Logo */}
          <Link to="/" className="flex items-center">
            <svg 
              className="w-8 h-8"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              style={{ 
                minWidth: "32px",
                minHeight: "32px",
                display: "block"
              }}
            >
              <path 
                d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-9 14H4v-2h7v2zm9 0h-7v-2h7v2zm0-4H4v-2h16v2zm0-4H4V6h16v2z" 
                fill="#3B82F6"
                stroke="none"
              />
            </svg>
            <span className="text-xl font-bold text-gray-900 ml-2">Feedback Force</span>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link to="/about" className="text-gray-600 hover:text-blue-600 font-medium">
              About
            </Link>
            <Link to="/app" className="text-gray-600 hover:text-blue-600 font-medium">
              App
            </Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">
              Dashboard
            </Link>
          </div>
        </div>
        
        {/* Search Box - Right Side (only show if hideSearch is false) */}
        {!hideSearch && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search feedback..."
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm || ''}
              onChange={(e) => {
                if (setSearchTerm) {
                  setSearchTerm(e.target.value);
                  
                  if (e.target.value.length > 2 && graphData) {
                    // Simple search implementation
                    const results = graphData.nodes.filter(node => 
                      node.type === 'feedback' && 
                      node.title && 
                      node.title.toLowerCase().includes(e.target.value.toLowerCase())
                    );
                    
                    if (setSearchResults) {
                      setSearchResults(results);
                      setShowSearchResults(true);
                    }
                  } else if (setShowSearchResults) {
                    setShowSearchResults(false);
                  }
                }
              }}
            />
            {showSearchResults && searchResults && searchResults.length > 0 && (
              <div className="absolute right-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
                <div className="p-2 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Search Results</span>
                    <button 
                      className="text-sm text-gray-500 hover:text-gray-700"
                      onClick={() => setShowSearchResults(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
                <ul>
                  {searchResults.map(result => (
                    <li 
                      key={result.id} 
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                      onClick={(e) => {
                        if (handleNodeClick) {
                          handleNodeClick(result, e);
                          setShowSearchResults(false);
                          setSearchTerm('');
                        }
                      }}
                    >
                      <div className="text-sm font-medium text-gray-800">{result.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{result.title?.substring(0, 100)}...</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default AppHeader; 
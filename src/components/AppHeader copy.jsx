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
  graphData
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      {/* Main navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
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
        </div>
        
        <div className="flex items-center space-x-8">
          <Link to="/#features" className="text-gray-600 hover:text-blue-600">Features</Link>
          <Link to="/#how-it-works" className="text-gray-600 hover:text-blue-600">How It Works</Link>
          <Link to="/app" className="text-gray-600 hover:text-blue-600">App</Link>
          
          {/* Search bar */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.length >= 2 && graphData?.nodes) {
                  const filteredResults = graphData.nodes.filter(node => 
                    node.name.toLowerCase().includes(e.target.value.toLowerCase())
                  );
                  setSearchResults(filteredResults);
                  setShowSearchResults(true);
                } else {
                  setShowSearchResults(false);
                  setSearchResults([]);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {showSearchResults && searchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div 
                    key={index}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      if (setSelectedNode && handleNodeClick) {
                        setSelectedNode(result);
                        handleNodeClick(result);
                      }
                      setShowSearchResults(false);
                    }}
                  >
                    <div className="flex items-center">
                      <span>{result.name}</span>
                      <span className="ml-2 text-xs text-gray-500">({result.type})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AppHeader; 
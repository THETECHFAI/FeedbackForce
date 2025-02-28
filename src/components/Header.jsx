import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <nav className="container mx-auto px-4 py-6 flex items-center justify-between bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center space-x-2">
        {/* Feedback Force Logo */}
        <Link to="/" className="flex items-center">
          <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-9 14H4v-2h7v2zm9 0h-7v-2h7v2zm0-4H4v-2h16v2zm0-4H4V6h16v2z"/>
          </svg>
          <span className="text-xl font-bold text-gray-900 ml-2">Feedback Force</span>
        </Link>
      </div>
      
      <div className="flex items-center space-x-8">
        <Link to="/#features" className="text-gray-600 hover:text-blue-600">Features</Link>
        <Link to="/#how-it-works" className="text-gray-600 hover:text-blue-600">How It Works</Link>
        <Link 
          to="/app" 
          className="text-gray-600 hover:text-blue-600"
        >
          App
        </Link>
      </div>
    </nav>
  );
};

export default Header; 
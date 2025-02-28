import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Transform User Feedback into Actionable Insights
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Harness the power of AI to automatically analyze feedback patterns, 
              discover themes, and visualize connections in your user research.
            </p>
            <Link 
              to="/app" 
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
          
          <div className="w-1/2 pl-12">
            <img 
              src="/images/hero-illustration.svg"
              alt="Network Visualization" 
              className="w-full h-auto shadow-lg rounded-lg"
              onError={(e) => {
                console.error('Image failed to load');
                e.target.style.backgroundColor = '#f0f4f8';
                e.target.style.padding = '2rem';
                e.target.style.border = '2px dashed #cbd5e0';
              }}
            />
            <p className="text-sm text-gray-500 mt-2">
              Image path: /images/hero-illustration.svg
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h2>
        <div className="grid grid-cols-3 gap-8">
          {[
            {
              title: "AI Theme Detection",
              description: "Automatically identify patterns and themes in user feedback",
              icon: "🤖"
            },
            {
              title: "Visual Network Analysis",
              description: "Interactive visualization of feedback relationships",
              icon: "🔍"
            },
            {
              title: "Smart Insights",
              description: "Get AI-powered analysis of user sentiment and priorities",
              icon: "✨"
            }
          ].map((feature, index) => (
            <div key={index} className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 
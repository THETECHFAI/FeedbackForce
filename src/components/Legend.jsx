import React from 'react';

const Legend = ({ colorScale, showSentiment = false, sentimentColors = {} }) => {
  const nodeTypes = [
    { type: 'theme', label: 'Theme (AI Generated)' },
    { type: 'feedback', label: 'Feedback' },
    { type: 'persona', label: 'User Role' }
  ];

  return (
    <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg border border-gray-200 shadow-md">
      <div className="text-sm font-semibold mb-2">Legend</div>
      <div className="space-y-2">
        {nodeTypes.map(item => (
          <div key={item.type} className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: colorScale(item.type) }}
            ></div>
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
        
        {showSentiment && (
          <>
            <div className="mt-3 pt-2 border-t border-gray-200">
              <div className="text-xs font-semibold mb-1">Sentiment</div>
              
              <div className="flex items-center mt-1">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: sentimentColors.positive }}></div>
                <span className="text-xs">Positive</span>
              </div>
              
              <div className="flex items-center mt-1">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: sentimentColors.neutral }}></div>
                <span className="text-xs">Neutral</span>
              </div>
              
              <div className="flex items-center mt-1">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: sentimentColors.negative }}></div>
                <span className="text-xs">Negative</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Legend; 
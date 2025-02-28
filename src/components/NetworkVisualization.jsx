import React from 'react';

const NetworkVisualization = () => {
  return (
    <div className="network-visualization">
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 380 280" 
        xmlns="http://www.w3.org/2000/svg"
        style={{display: 'block'}}
      >
        {/* Background */}
        <rect width="380" height="280" fill="#EBF8FF" rx="8" />
        
        {/* Central node */}
        <circle cx="190" cy="140" r="30" fill="#3182CE" />
        <text x="190" y="145" textAnchor="middle" fill="white" fontWeight="bold">Feedback</text>
        
        {/* Theme nodes */}
        <circle cx="100" cy="80" r="20" fill="#38A169" />
        <text x="100" y="85" textAnchor="middle" fill="white" fontSize="10">Performance</text>
        
        <circle cx="280" cy="80" r="20" fill="#38A169" />
        <text x="280" y="85" textAnchor="middle" fill="white" fontSize="10">UI/UX</text>
        
        <circle cx="100" cy="200" r="20" fill="#38A169" />
        <text x="100" y="205" textAnchor="middle" fill="white" fontSize="10">Mobile</text>
        
        <circle cx="280" cy="200" r="20" fill="#38A169" />
        <text x="280" y="205" textAnchor="middle" fill="white" fontSize="10">Features</text>
        
        {/* User nodes */}
        <circle cx="190" cy="40" r="15" fill="#DD6B20" />
        <text x="190" y="44" textAnchor="middle" fill="white" fontSize="9">Power User</text>
        
        <circle cx="190" cy="240" r="15" fill="#DD6B20" />
        <text x="190" y="244" textAnchor="middle" fill="white" fontSize="9">New User</text>
        
        <circle cx="40" cy="140" r="15" fill="#DD6B20" />
        <text x="40" y="144" textAnchor="middle" fill="white" fontSize="9">Admin</text>
        
        <circle cx="340" cy="140" r="15" fill="#DD6B20" />
        <text x="340" y="144" textAnchor="middle" fill="white" fontSize="9">Mobile User</text>
        
        {/* Feedback nodes */}
        <circle cx="140" cy="110" r="10" fill="#E53E3E" />
        <circle cx="240" cy="110" r="10" fill="#4299E1" />
        <circle cx="140" cy="170" r="10" fill="#4299E1" />
        <circle cx="240" cy="170" r="10" fill="#E53E3E" />
        
        {/* Connection lines */}
        <line x1="190" y1="140" x2="100" y2="80" stroke="#CBD5E0" strokeWidth="2" />
        <line x1="190" y1="140" x2="280" y2="80" stroke="#CBD5E0" strokeWidth="2" />
        <line x1="190" y1="140" x2="100" y2="200" stroke="#CBD5E0" strokeWidth="2" />
        <line x1="190" y1="140" x2="280" y2="200" stroke="#CBD5E0" strokeWidth="2" />
        <line x1="190" y1="140" x2="190" y2="40" stroke="#CBD5E0" strokeWidth="2" />
        <line x1="190" y1="140" x2="190" y2="240" stroke="#CBD5E0" strokeWidth="2" />
        <line x1="190" y1="140" x2="40" y2="140" stroke="#CBD5E0" strokeWidth="2" />
        <line x1="190" y1="140" x2="340" y2="140" stroke="#CBD5E0" strokeWidth="2" />
        <line x1="190" y1="140" x2="140" y2="110" stroke="#CBD5E0" strokeWidth="1" />
        <line x1="190" y1="140" x2="240" y2="110" stroke="#CBD5E0" strokeWidth="1" />
        <line x1="190" y1="140" x2="140" y2="170" stroke="#CBD5E0" strokeWidth="1" />
        <line x1="190" y1="140" x2="240" y2="170" stroke="#CBD5E0" strokeWidth="1" />
      </svg>
    </div>
  );
};

export default NetworkVisualization; 
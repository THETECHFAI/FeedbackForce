import React from 'react';

const HeroIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
    {/* Background with gradient */}
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EBF8FF" />
        <stop offset="100%" stopColor="#E6FFFA" />
      </linearGradient>
      <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3182CE" />
        <stop offset="100%" stopColor="#4299E1" />
      </linearGradient>
      <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38A169" />
        <stop offset="100%" stopColor="#48BB78" />
      </linearGradient>
      <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DD6B20" />
        <stop offset="100%" stopColor="#ED8936" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#2D3748" floodOpacity="0.1" />
      </filter>
    </defs>
    
    {/* Main background */}
    <rect width="500" height="400" rx="12" fill="url(#bgGradient)" filter="url(#shadow)" />
    
    {/* Network Connections */}
    <g strokeWidth="2" stroke="#CBD5E0">
      <line x1="250" y1="200" x2="150" y2="130" />
      <line x1="250" y1="200" x2="350" y2="130" />
      <line x1="250" y1="200" x2="150" y2="270" />
      <line x1="250" y1="200" x2="350" y2="270" />
      <line x1="250" y1="200" x2="250" y2="100" />
      <line x1="250" y1="200" x2="250" y2="300" />
      <line x1="250" y1="200" x2="100" y2="200" />
      <line x1="250" y1="200" x2="400" y2="200" />
      <line x1="150" y1="130" x2="350" y2="130" strokeWidth="1.5" opacity="0.7" />
      <line x1="150" y1="270" x2="350" y2="270" strokeWidth="1.5" opacity="0.7" />
      <line x1="100" y1="200" x2="150" y2="130" strokeWidth="1.5" opacity="0.7" />
      <line x1="100" y1="200" x2="150" y2="270" strokeWidth="1.5" opacity="0.7" />
      <line x1="400" y1="200" x2="350" y2="130" strokeWidth="1.5" opacity="0.7" />
      <line x1="400" y1="200" x2="350" y2="270" strokeWidth="1.5" opacity="0.7" />
    </g>
    
    {/* Network Nodes */}
    <g>
      {/* Central node */}
      <circle cx="250" cy="200" r="35" fill="url(#primaryGradient)" />
      <text x="250" y="205" textAnchor="middle" fill="white" fontWeight="bold" fontSize="14">Feedback</text>
      
      {/* Theme nodes */}
      <circle cx="150" cy="130" r="25" fill="url(#secondaryGradient)" />
      <text x="150" y="135" textAnchor="middle" fill="white" fontWeight="bold" fontSize="11">UI/UX</text>
      
      <circle cx="350" cy="130" r="25" fill="url(#secondaryGradient)" />
      <text x="350" y="135" textAnchor="middle" fill="white" fontWeight="bold" fontSize="11">Performance</text>
      
      <circle cx="150" cy="270" r="25" fill="url(#secondaryGradient)" />
      <text x="150" y="275" textAnchor="middle" fill="white" fontWeight="bold" fontSize="11">Mobile</text>
      
      <circle cx="350" cy="270" r="25" fill="url(#secondaryGradient)" />
      <text x="350" y="275" textAnchor="middle" fill="white" fontWeight="bold" fontSize="11">Features</text>
      
      {/* User persona nodes */}
      <circle cx="250" cy="100" r="20" fill="url(#accentGradient)" />
      <text x="250" y="105" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">Power User</text>
      
      <circle cx="250" cy="300" r="20" fill="url(#accentGradient)" />
      <text x="250" y="305" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">New User</text>
      
      <circle cx="100" cy="200" r="20" fill="url(#accentGradient)" />
      <text x="100" y="205" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">Admin</text>
      
      <circle cx="400" cy="200" r="20" fill="url(#accentGradient)" />
      <text x="400" y="205" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">Mobile User</text>
      
      {/* Feedback nodes */}
      <circle cx="200" cy="165" r="12" fill="#E53E3E" />
      <circle cx="300" cy="165" r="12" fill="#4299E1" />
      <circle cx="200" cy="235" r="12" fill="#4299E1" />
      <circle cx="300" cy="235" r="12" fill="#E53E3E" />
    </g>
    
    {/* Pulse animation */}
    <circle cx="250" cy="200" r="45" stroke="#3182CE" strokeWidth="2" fill="none" opacity="0.3">
      <animate attributeName="r" values="45;60;45" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export default HeroIllustration; 
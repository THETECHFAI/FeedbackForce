import React from 'react';

const NetworkVisualization = () => {
  return (
    <div className="hero-image" style={{ 
      width: "100%", 
      maxWidth: "100%", 
      position: "relative", 
      boxShadow: "none",
      overflow: "hidden",
      boxSizing: "border-box"
    }}>
      <div className="image-container" style={{ 
        width: "100%",
        maxWidth: "100%",
        height: "375px",
        padding: 0,
        margin: 0,
        position: "relative",
        overflow: "hidden",
        boxShadow: "none",
        background: "transparent",
        border: "none",
        boxSizing: "border-box"
      }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="800 40 400 200" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ 
            background: "transparent",
            filter: "none"
          }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Generate network with medium zoom level */}
          <g>
            {/* Central node */}
            <circle cx="1000" cy="140" r="22" fill="#3182CE" />
            
            {/* First ring of connections - reduced density */}
            {Array.from({ length: 20 }).map((_, i) => {
              const angle = (i * 18) * Math.PI / 180;
              const x = 1000 + Math.cos(angle) * 70;
              const y = 140 + Math.sin(angle) * 55;
              const color = ['#3182CE', '#38A169', '#DD6B20', '#E53E3E', '#805AD5', '#4299E1'][Math.floor(Math.random() * 6)];
              return (
                <React.Fragment key={`inner-${i}`}>
                  <line 
                    x1="1000" 
                    y1="140" 
                    x2={x} 
                    y2={y} 
                    stroke="#CBD5E0" 
                    strokeWidth="2" 
                    opacity="0.8" 
                  />
                  <circle 
                    cx={x} 
                    cy={y} 
                    r="7"
                    fill={color} 
                  />
                </React.Fragment>
              );
            })}
            
            {/* Second ring - adjusted to prevent overlaps */}
            {Array.from({ length: 40 }).map((_, i) => {
              const angle = (i * 9) * Math.PI / 180;
              const distance = 130 + Math.random() * 40;
              const x = 1000 + Math.cos(angle) * distance;
              const y = 140 + Math.sin(angle) * (distance * 0.7);
              const connectToCenter = Math.random() > 0.5;
              const color = ['#3182CE', '#38A169', '#DD6B20', '#E53E3E', '#805AD5', '#4299E1', '#D69E2E', '#319795', '#B83280'][Math.floor(Math.random() * 9)];
              return (
                <React.Fragment key={`middle-${i}`}>
                  {connectToCenter && (
                    <line 
                      x1="1000" 
                      y1="140" 
                      x2={x} 
                      y2={y} 
                      stroke="#CBD5E0" 
                      strokeWidth="1.5" 
                      opacity="0.6" 
                    />
                  )}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r="5.5"
                    fill={color} 
                  />
                </React.Fragment>
              );
            })}
            
            {/* Outer ring - more spread */}
            {Array.from({ length: 80 }).map((_, i) => {
              const angle = (i * 4.5) * Math.PI / 180;
              const distance = 180 + Math.random() * 100;
              const x = 1000 + Math.cos(angle) * distance;
              const y = 140 + Math.sin(angle) * (distance * 0.6);
              const connectToCenter = Math.random() > 0.7;
              const color = ['#3182CE', '#38A169', '#DD6B20', '#E53E3E', '#805AD5', '#4299E1', '#D69E2E', '#319795', '#B83280'][Math.floor(Math.random() * 9)];
              return (
                <React.Fragment key={`outer-${i}`}>
                  {connectToCenter && (
                    <line 
                      x1="1000" 
                      y1="140" 
                      x2={x} 
                      y2={y} 
                      stroke="#CBD5E0" 
                      strokeWidth="1" 
                      opacity="0.4" 
                    />
                  )}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r="4" 
                    fill={color} 
                  />
                </React.Fragment>
              );
            })}
            
            {/* Node-to-node connections */}
            {Array.from({ length: 70 }).map((_, i) => {
              const angle1 = Math.random() * 360 * Math.PI / 180;
              const angle2 = Math.random() * 360 * Math.PI / 180;
              const distance1 = 60 + Math.random() * 180;
              const distance2 = 60 + Math.random() * 180;
              const x1 = 1000 + Math.cos(angle1) * distance1;
              const y1 = 140 + Math.sin(angle1) * (distance1 * 0.7);
              const x2 = 1000 + Math.cos(angle2) * distance2;
              const y2 = 140 + Math.sin(angle2) * (distance2 * 0.7);
              
              // Only connect if the nodes are somewhat close
              const dx = x1 - x2;
              const dy = y1 - y2;
              const distance = Math.sqrt(dx*dx + dy*dy);
              
              if (distance < 120) {
                return (
                  <line 
                    key={`connection-${i}`}
                    x1={x1} 
                    y1={y1} 
                    x2={x2} 
                    y2={y2} 
                    stroke="#CBD5E0" 
                    strokeWidth="1" 
                    opacity="0.3" 
                  />
                );
              }
              return null;
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default NetworkVisualization; 
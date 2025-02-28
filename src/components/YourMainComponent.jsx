import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const handleTest = async () => {
  const result = await testOpenAI("The navigation is confusing and I can't find where to access my settings");
  console.log('Test result:', result);
};

function YourMainComponent() {
  const miniMapRef = useRef(null);
  const simulationRef = useRef(null);
  
  const centerVisualization = () => {
    try {
      // Adjust these dimensions to match the aspect ratio of your main view
      const miniMapWidth = 200;
      const miniMapHeight = 200; // Made square to match your UI
      
      // Get the actual bounds of all nodes
      const nodes = simulationRef.current.nodes();
      const xExtent = d3.extent(nodes, d => d.x);
      const yExtent = d3.extent(nodes, d => d.y);
      
      // Calculate the required viewport that encompasses all nodes
      const viewportWidth = xExtent[1] - xExtent[0] + 50;  // Add padding
      const viewportHeight = yExtent[1] - yExtent[0] + 50;
      
      // Update mini-map view with calculated bounds
      if (miniMapRef.current) {
        d3.select(miniMapRef.current)
          .attr('viewBox', `${xExtent[0] - 25} ${yExtent[0] - 25} ${viewportWidth} ${viewportHeight}`)
          .attr('width', miniMapWidth)
          .attr('height', miniMapHeight)
          .attr('preserveAspectRatio', 'xMidYMid meet');
      }
      
      // Center the simulation
      simulationRef.current
        .force('center', d3.forceCenter(0, 0))
        .force('bounds', d3.forceCenter()
          .x(miniMapWidth / 2)
          .y(miniMapHeight / 2)
          .strength(0.1))
        .alpha(0.3)
        .restart();

    } catch (error) {
      console.error('Error centering visualization:', error);
    }
  };

  useEffect(() => {
    try {
      // Store simulation reference
      simulationRef.current = simulation; // your existing simulation
      
      // Initial centering
      centerVisualization();
      
      // Add window resize handler
      const handleResize = () => {
        centerVisualization();
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    } catch (error) {
      console.error('Error in initialization:', error);
    }
  }, []);

  const handleReset = () => {
    try {
      // Reset node positions
      const nodes = simulationRef.current.nodes();
      nodes.forEach(node => {
        delete node.fx;
        delete node.fy;
      });
      
      // Re-center
      centerVisualization();
    } catch (error) {
      console.error('Error in reset:', error);
    }
  };

  const handleImportFeedback = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Check if it has the expected format
        if (importedData.feedback && Array.isArray(importedData.feedback)) {
          // Pass the data to your main visualization component
          // This depends on how your components are structured
          console.log('Imported feedback data:', importedData.feedback);
          
          // You might want to use a context, props, or a state management library
          // to pass this data to UserResearchNetwork component
        } else {
          console.error("Invalid data format. The file must contain a 'feedback' array.");
          alert("Invalid data format. The file must contain a 'feedback' array.");
        }
      } catch (err) {
        console.error("Error parsing the file:", err);
        alert("Error parsing the file. Please make sure it's a valid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const downloadSampleTemplate = () => {
    const sampleData = {
      feedback: [
        {
          id: "feedback-1",
          text: "The application is too slow when loading large datasets",
          user_role: "Data Analyst",
          timestamp: "2023-07-15T14:30:00Z"
        },
        {
          id: "feedback-2",
          text: "I love the new dashboard layout, it makes finding information much easier",
          user_role: "Product Manager",
          timestamp: "2023-07-16T09:45:00Z"
        },
        {
          id: "feedback-3",
          text: "The mobile app is missing key features that are available on the desktop version",
          user_role: "Field Sales Rep",
          timestamp: "2023-07-17T11:20:00Z"
        }
      ]
    };
    
    const dataStr = JSON.stringify(sampleData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'feedback-template.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="main-layout">
      {/* ... your existing JSX ... */}
      <button 
        className="reset"
        onClick={handleReset}
      >
        Reset
      </button>
      
      <svg 
        ref={miniMapRef}
        className="mini-map"
        style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          border: '1px solid #e5e7eb',
          background: '#f8fafc'
        }}
      >
        {/* mini-map content */}
      </svg>
      
      <div className="import-controls">
        <label 
          htmlFor="import-feedback" 
          className="import-button"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: '#3182ce',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '16px'
          }}
        >
          Import Feedback
        </label>
        <input
          id="import-feedback"
          type="file"
          accept=".json"
          onChange={handleImportFeedback}
          style={{ display: 'none' }}
        />
        
        <button 
          onClick={downloadSampleTemplate}
          style={{
            padding: '8px 16px',
            backgroundColor: '#e2e8f0',
            color: '#4a5568',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Download Template
        </button>
      </div>
    </div>
  );
}

export default YourMainComponent; 
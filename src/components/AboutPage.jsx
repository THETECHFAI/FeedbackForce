import React from 'react';
import NetworkVisualization from './NetworkVisualization';

const AboutPage = () => {
  return (
    <div className="about-page">
      <h1>About Feedback Force</h1>
      <p>Learn how Feedback Force visualizes and analyzes user feedback with interactive examples. This page shows sample data to demonstrate the platform's capabilities.</p>

      <section className="app-section">
        <h2>App Page</h2>
        <div className="tabs">
          <button className="tab active">Network Visualization</button>
        </div>
        <p>
          The App page provides an interactive network visualization that shows the relationships between feedback, themes, user roles, and sentiment. You can explore connections, filter data, and discover patterns.
        </p>

        <div className="network-visualization-section">
          <h3>Network Visualization</h3>
          <div className="visualization-container">
            {/* This is where we use our shared component */}
            <NetworkVisualization />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 
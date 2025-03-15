import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import UserResearchNetwork from './components/UserResearchNetwork';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import './App.css';

function App() {
  const [graphData, setGraphData] = React.useState(null);

  // Function to update graph data that will be passed to both components
  const updateGraphData = (data) => {
    console.log("Updating graph data", data);
    setGraphData(data);
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={
            <div className="visualization-container">
              <UserResearchNetwork onDataProcessed={updateGraphData} />
            </div>
          } />
          <Route path="/dashboard" element={<DashboardPage graphData={graphData} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 
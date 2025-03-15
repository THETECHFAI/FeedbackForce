import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NetworkVisualization from './NetworkVisualization';
import './LandingPage.css';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="landing-page">
      {/* Remove the problematic inline style that might be affecting layout */}
      
      {/* Apply a more targeted fix for the horizontal scroll issue */}
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          overflow-x: hidden;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        
        /* Ensure the header isn't affected by our fixes */
        .site-header {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          padding: 0;
        }
        
        .header-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 10%;
          box-sizing: border-box;
        }
        
        /* Fix the problematic arrow element */
        [class*="scroll-arrow"] {
          position: fixed;
          right: 10px;
          max-width: 60px;
          z-index: 100;
          transform: translateX(0);
        }
      `}} />

      {/* Header/Navigation */}
      <header className="site-header">
        <div className="header-container">
          <div className="logo">
            <span className="logo-icon">
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
  {/* Use the path properly with stroke and fill separately */}
  <path 
    d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-9 14H4v-2h7v2zm9 0h-7v-2h7v2zm0-4H4v-2h16v2zm0-4H4V6h16v2z" 
    fill="#3B82F6"
    stroke="none"
  />
</svg>
            </span>
            <span className="logo-text">Feedback Force</span>
          </div>
          <nav className="main-nav">
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/app" className="nav-button">Launch App</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Value Proposition Section */}
      <div className="value-proposition">
        <div className="value-content">
          <h2>AI-Powered User Feedback Analysis</h2>
          <p>Transform user feedback into actionable insights. AI-powered theme detection and relationship mapping.</p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero" style={{ 
        boxShadow: "none", 
        borderBottom: "none", 
        position: "relative",
        zIndex: 1,
        overflow: "visible",
        paddingBottom: 0,
        height: "auto",
        minHeight: "55vh",
        display: "flex",
        alignItems: "center",
        paddingTop: "80px"
      }}>
        <div className="banner-overlay"></div>
        
        {/* Left Content */}
        <div className="hero-content">
          <h1 className={`title ${isVisible ? 'fade-in' : ''}`}>
            <span className="title-highlight">Feedback</span> Force
          </h1>
          <p className={`subtitle ${isVisible ? 'fade-in delay-1' : ''}`}>
            Transform user feedback into actionable insights with AI-powered analysis and visualization
          </p>
          <div className={`cta-container ${isVisible ? 'fade-in delay-2' : ''}`}>
            <Link to="/app" className="cta-button">
              Get Started
            </Link>
            <a href="#how-it-works" className="secondary-link">
              Learn More
            </a>
          </div>
        </div>
        
        {/* Right Image */}
        <div className={`hero-image ${isVisible ? 'fade-in delay-1' : ''}`} style={{ 
          width: "100%", 
          maxWidth: "100%", 
          position: "absolute", 
          left: 0, 
          right: 0,
          boxShadow: "none",
          overflow: "hidden",
          boxSizing: "border-box"
        }}>
          <NetworkVisualization />
        </div>
      </section>

      {/* New CTA Section - Added above Features */}
      <section className="cta-banner">
        <div className="cta-banner-content">
          <h2>Ready to transform your feedback data?</h2>
          <Link to="/app" className="cta-banner-button">
            Start Analyzing Your Feedback
          </Link>
        </div>
      </section>

      {/* Features Section - clean transition */}
      <section className="features" id="features" style={{
        position: "relative",
        zIndex: 5,
        boxShadow: "none",
        borderTop: "none",
        background: "white",
        marginTop: 0,
        paddingTop: "3rem"
      }}>
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3>AI Theme Detection</h3>
            <p>Automatically identify patterns and themes in user feedback</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <h3>Visual Network Analysis</h3>
            <p>Interactive visualization of feedback relationships</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>Persona Insights</h3>
            <p>Understand feedback patterns across different user roles</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </div>
            <h3>Smart Sentiment Analysis</h3>
            <p>AI-powered analysis of user sentiment and priorities</p>
          </div>
        </div>
      </section>

      {/* How It Works Section - updated to match Key Features format */}
      <section className="how-it-works" id="how-it-works">
        <h2>How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h3>Import your feedback data</h3>
            <p>Upload your customer feedback from various sources</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3>AI analyzes patterns</h3>
            <p>Our AI identifies themes, sentiment, and relationships</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <h3>Explore insights</h3>
            <p>Interact with the visualization to discover actionable insights</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>Take action</h3>
            <p>Implement changes based on data-driven feedback insights</p>
          </div>
        </div>
        
        <div className="cta-container" style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link to="/app" className="cta-button">
            Start Analyzing Your Feedback
          </Link>
        </div>
      </section>

      {/* Footer - more compact */}
      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <h2>Feedback Force</h2>
            <p>Transform feedback into insights</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h3>Product</h3>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><Link to="/app">Dashboard</Link></li>
              </ul>
            </div>
            <div className="footer-column">
  <h3>Contact</h3>
  <ul>
    <li>
      <a href="mailto:hello@faisalshariff.io">Faisal Shariff</a>
    </li>
  </ul>
</div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Feedback Force. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 
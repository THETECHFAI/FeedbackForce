// UserResearchNetwork.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { classifyFeedback, generateFeatureIdeas, analyzeSentiment } from '../services/openaiService';

import FeedbackImporter from './FeedbackImporter';
import { processFeedbackData, importFeedbackData } from '../utils/importData';
import Legend from './Legend';
import Navigation from './Navigation';
import Header from './Header';
import AppHeader from './AppHeader';

// Color scale for node types
const colorScale = d3.scaleOrdinal()
  .domain(["theme", "feedback-positive", "feedback-neutral", "feedback-negative", "feedback", "persona"])
  .range(["#3182CE", "#38A169", "#A0AEC0", "#E53E3E", "#38A169", "#DD6B20"]); // Blue, Green, Gray, Red, Green, Orange

// Initial data structure
const initialData = {
  nodes: [
    { id: "theme1", name: "Performance", type: "theme", feedbackCount: 10 },
    { id: "theme2", name: "User Interface", type: "theme", feedbackCount: 8 },
    { id: "theme3", name: "Mobile Experience", type: "theme", feedbackCount: 6 },
    { id: "persona1", name: "Data Analyst", type: "persona" },
    { id: "persona2", name: "Marketing Manager", type: "persona" },
    { id: "feature1", name: "Performance Optimization", type: "feature", priority: "High" }
  ],
  links: [
    { source: "theme1", target: "persona1", strength: 0.7 },
    { source: "theme2", target: "persona1", strength: 0.5 },
    { source: "theme1", target: "feature1", strength: 0.8 },
    { source: "persona1", target: "feature1", strength: 0.6 }
  ]
};

// Main component
const UserResearchNetwork = () => {
  // Refs
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const zoomRef = useRef(null);
  const simulationRef = useRef(null);
  
  // State
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightMode, setHighlightMode] = useState('none');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // AI state
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiError, setAIError] = useState(null);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [showAIInsightsPanel, setShowAIInsightsPanel] = useState(false);
  const [aiInsights, setAIInsights] = useState({ results: [] });
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [panelWidth, setPanelWidth] = useState(320);
  
  const [insights, setInsights] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Add these state variables back
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Add a state to track if data has been imported
  const [hasImportedData, setHasImportedData] = useState(false);

  // Add these debug effect hooks at the top level
  useEffect(() => {
    console.log("showAIInsightsPanel value changed:", showAIInsightsPanel);
  }, [showAIInsightsPanel]);

  useEffect(() => {
    if (showAIInsightsPanel && aiInsights) {
      console.log("AI Insights Panel content:", aiInsights);
    }
  }, [showAIInsightsPanel, aiInsights]);

  // MiniMap implementation - define this before any useEffects that use it
  const createMiniMap = useCallback(() => {
    if (!svgRef.current || !graphData.nodes || graphData.nodes.length === 0) return () => {};
    
    const svg = d3.select(svgRef.current);
    
    // Remove any existing mini-map
    svg.selectAll(".mini-map-container").remove();
    
    // Calculate mini-map size based on the main SVG dimensions
    const miniMapSize = Math.min(dimensions.width, dimensions.height) * 0.25;
    const miniMapMargin = 20;
    
    // Create a container for the mini-map
    const miniMapContainer = svg.append("g")
      .attr("class", "mini-map-container")
      .attr("transform", `translate(${miniMapMargin}, ${miniMapMargin})`);
    
    // Add a background rectangle
    miniMapContainer.append("rect")
      .attr("width", miniMapSize)
      .attr("height", miniMapSize)
      .attr("fill", "#f0f4f8")
      .attr("fill-opacity", 0.9)
      .attr("stroke", "#3182CE")
      .attr("stroke-width", 2)
      .attr("rx", 6);
    
    // Create a separate mini-map simulation
    const miniMapNodes = graphData.nodes.map(node => ({
      ...node,
      miniX: Math.random() * miniMapSize,
      miniY: Math.random() * miniMapSize
    }));
    
    // Create links array with proper source/target references
    const miniMapLinks = graphData.links.map(link => {
      // Extract source and target IDs consistently
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      return {
        source: sourceId,
        target: targetId
      };
    }).filter(link => {
      // Filter out links with invalid source or target
      return miniMapNodes.some(n => n.id === link.source) && 
             miniMapNodes.some(n => n.id === link.target);
    });
    
    // Create a separate force simulation just for the mini-map
    const miniMapSimulation = d3.forceSimulation(miniMapNodes)
      .force("link", d3.forceLink(miniMapLinks).id(d => d.id).distance(5))
      .force("charge", d3.forceManyBody().strength(-20))
      .force("center", d3.forceCenter(miniMapSize / 2, miniMapSize / 2))
      .force("collide", d3.forceCollide().radius(4));
    
    // Add mini-map links
    const miniLinks = miniMapContainer.selectAll(".mini-link")
      .data(miniMapLinks)
      .enter()
      .append("line")
      .attr("class", "mini-link")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5);
    
    // Add mini-map nodes
    const miniNodes = miniMapContainer.selectAll(".mini-node")
      .data(miniMapNodes)
      .enter()
      .append("circle")
      .attr("class", "mini-node")
      .attr("r", 3)
      .attr("fill", d => {
        // Use the same color scale but with higher opacity
        const baseColor = colorScale(d.type);
        return d3.color(baseColor).brighter(0.3);
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);
    
    // Add a label
    miniMapContainer.append("text")
      .attr("x", 10)
      .attr("y", 15)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#2D3748")
      .text("Network Overview");
    
    // Add a border to show the current viewport
    const viewportRect = miniMapContainer.append("rect")
      .attr("class", "mini-map-viewport")
      .attr("width", miniMapSize)
      .attr("height", miniMapSize)
      .attr("fill", "none")
      .attr("stroke", "#3182ce")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4");
    
    // Run the mini-map simulation for a fixed number of ticks
    miniMapSimulation.stop();
    for (let i = 0; i < 300; i++) {
      miniMapSimulation.tick();
    }
    
    // Update the mini-map nodes with their final positions
    miniLinks
      .attr("x1", d => {
        const source = miniMapNodes.find(n => n.id === d.source);
        return source ? source.miniX : 0;
      })
      .attr("y1", d => {
        const source = miniMapNodes.find(n => n.id === d.source);
        return source ? source.miniY : 0;
      })
      .attr("x2", d => {
        const target = miniMapNodes.find(n => n.id === d.target);
        return target ? target.miniX : 0;
      })
      .attr("y2", d => {
        const target = miniMapNodes.find(n => n.id === d.target);
        return target ? target.miniY : 0;
      });
    
    miniNodes
      .attr("cx", d => d.miniX)
      .attr("cy", d => d.miniY);
    
    // Add click behavior
    miniMapContainer.append("rect")
      .attr("width", miniMapSize)
      .attr("height", miniMapSize)
      .attr("fill", "transparent")
      .attr("stroke", "none")
      .style("cursor", "pointer")
      .on("click", (event) => {
        if (!zoomRef.current) return;
        
        // Get click position relative to mini-map
        const [x, y] = d3.pointer(event);
        
        // Calculate the center point in the main view
        const centerX = (x / miniMapSize) * dimensions.width;
        const centerY = (y / miniMapSize) * dimensions.height;
        
        // Create a transform that centers on the clicked point
        const transform = d3.zoomIdentity
          .translate(dimensions.width / 2, dimensions.height / 2)
          .scale(1)
          .translate(-centerX, -centerY);
        
        // Apply the transform with a smooth transition
        svg.transition()
          .duration(750)
          .call(zoomRef.current.transform, transform);
      });
    
    // Return cleanup function
    return () => {
      svg.selectAll(".mini-map-container").remove();
      if (miniMapSimulation) miniMapSimulation.stop();
    };
  }, [dimensions, graphData, colorScale]);

  // Simulate loading data on initial render - without createMiniMap dependency
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Add a separate effect to create the mini-map after loading
  useEffect(() => {
    if (!loading && showMiniMap && svgRef.current) {
      const timer = setTimeout(() => {
        createMiniMap();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, showMiniMap, dimensions]);

  // Create a minimap when needed
  useEffect(() => {
    // Only create minimap if the SVG ref exists, dimensions are valid, and showMiniMap is true
    if (svgRef.current && dimensions.width > 0 && dimensions.height > 0 && showMiniMap) {
      // Remove any existing mini-map first to prevent duplicates
      d3.select(svgRef.current).selectAll(".mini-map-container").remove();
      
      const cleanupMiniMap = createMiniMap();
      return cleanupMiniMap;
    } else {
      // Clean up any existing mini-map if showMiniMap is false
      d3.select(svgRef.current).selectAll(".mini-map-container").remove();
    }
  }, [showMiniMap, graphData, dimensions.width, dimensions.height, selectedNode]);

  // Update dimensions when window resizes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    
    resizeObserver.observe(containerRef.current);
    updateDimensions();
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, []);

  // Adjust container dimensions when panel is open
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Adjust dimensions based on panel state
      if (showAIInsightsPanel && !isPanelCollapsed) {
        // Reduce width to make room for the panel
        setDimensions({
          width: containerWidth - panelWidth,
          height: containerHeight
        });
      } else {
        // Use full width
        setDimensions({
          width: containerWidth,
          height: containerHeight
        });
      }
    }
  }, [showAIInsightsPanel, isPanelCollapsed, panelWidth]);

  // Recenter view when panel state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      centerView();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [showAIInsightsPanel, isPanelCollapsed]);

  // Recalculate feedback counts when feedback items change
  useEffect(() => {
    if (feedbackItems.length > 0) {
      recalculateFeedbackCounts();
    }
  }, [feedbackItems]);

  // Main visualization rendering effect
  useEffect(() => {
    if (!svgRef.current || !dimensions.width || !dimensions.height) return;
    
    console.log("Rendering with data:", graphData);
    
    // Clear the SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // Create a container group for all elements
    const g = svg.append("g");
    
    // Set up zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    svg.call(zoom);
    zoomRef.current = zoom;
    
    // Verify we have valid data
    if (!graphData.nodes || !graphData.links || 
        !Array.isArray(graphData.nodes) || !Array.isArray(graphData.links) ||
        graphData.nodes.length === 0) {
      console.error("Invalid or empty graph data:", graphData);
      return;
    }
    
    // Create working copies of the data with proper link references
    const nodes = graphData.nodes.map(node => ({...node}));
    
    // Normalize links to ensure proper format for D3
    const normalizedLinks = graphData.links.map(link => {
      // Extract source and target IDs consistently
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      // Return a new link object with just IDs (D3 will convert to objects)
      return {
        source: sourceId,
        target: targetId,
        strength: link.strength || 0.5
      };
    });
    
    // Verify all links have valid source and target nodes
    const validLinks = normalizedLinks.filter(link => {
      const sourceExists = nodes.some(node => node.id === link.source);
      const targetExists = nodes.some(node => node.id === link.target);
      if (!sourceExists) console.warn(`Link has invalid source: ${link.source}`);
      if (!targetExists) console.warn(`Link has invalid target: ${link.target}`);
      return sourceExists && targetExists;
    });
    
    console.log(`Found ${validLinks.length} valid links out of ${normalizedLinks.length}`);
    
    // Create the force simulation with strong link forces
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(validLinks)
        .id(d => d.id)
        .distance(100)
        .strength(1)) // Stronger link force for better connections
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force("collide", d3.forceCollide(30));
    
    simulationRef.current = simulation;
    
    // Create the links
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(validLinks)
      .enter()
      .append("line")
      .attr("stroke-width", d => Math.max(2, d.strength * 6))
      .attr("stroke", "#ccc")
      .attr("opacity", d => {
        // Apply opacity to links based on highlight mode
        if (highlightMode === 'none') return 0.8;  // Default opacity
        
        // Get source and target node objects
        const sourceNode = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source);
        const targetNode = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target);
        
        if (!sourceNode || !targetNode) return 0.2;  // Fade out if invalid link
        
        // Highlight links between nodes of the highlighted type
        if (highlightMode === 'themes' && 
            (sourceNode.type === 'theme' || targetNode.type === 'theme')) {
          return 1.0;
        }
        
        if (highlightMode === 'feedback' && 
            (sourceNode.type === 'feedback' || targetNode.type === 'feedback')) {
          return 1.0;
        }
        
        if (highlightMode === 'personas' && 
            (sourceNode.type === 'persona' || targetNode.type === 'persona')) {
          return 1.0;
        }
        
        return 0.2;  // Fade out non-highlighted links
      });
    
    // Create the nodes
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("click", (event, d) => {
        // Prevent text selection
        event.preventDefault();
        document.getSelection().removeAllRanges();
        
        // Call the node click handler
        handleNodeClick(d, event);
      });
    
    // Add circles to nodes with appropriate colors
    node.append("circle")
      .attr("r", d => {
        if (d.type === "theme") return 20 + (d.feedbackCount / 2);
        if (d.type === "persona") return 15;
        return 10; // Smaller feedback nodes
      })
      .attr("fill", d => {
        // Update this section to use sentiment-based coloring for feedback nodes
        if (d.type === "feedback") {
          if (d.sentiment === "Positive") return colorScale("feedback-positive");
          if (d.sentiment === "Negative") return colorScale("feedback-negative");
          return colorScale("feedback-neutral"); // Default to neutral if sentiment is not set or is "Neutral"
        }
        return colorScale(d.type);
      })
      .attr("stroke", d => {
        // Add a special stroke to highlighted nodes
        if (highlightMode !== 'none') {
          if (highlightMode === 'themes' && d.type === 'theme') {
            return "#FFD700"; // Gold stroke for highlighted theme nodes
          }
          if (highlightMode === 'feedback' && d.type === 'feedback') {
            return "#FFD700"; // Gold stroke for highlighted feedback nodes
          }
          if (highlightMode === 'personas' && d.type === 'persona') {
            return "#FFD700"; // Gold stroke for highlighted persona nodes
          }
        }
        return "#fff"; // Default white stroke
      })
      .attr("stroke-width", d => {
        // Thicker stroke for highlighted nodes
        if (highlightMode !== 'none') {
          if (highlightMode === 'themes' && d.type === 'theme') return 3;
          if (highlightMode === 'feedback' && d.type === 'feedback') return 3;
          if (highlightMode === 'personas' && d.type === 'persona') return 3;
        }
        return 2; // Default stroke width
      })
      .attr("opacity", d => {
        // Apply opacity to nodes based on highlight mode
        if (highlightMode === 'none') return 1.0;  // Full opacity if no highlighting
        
        // Highlight specific node types
        if (highlightMode === 'themes' && d.type === 'theme') return 1.0;
        if (highlightMode === 'feedback' && d.type === 'feedback') return 1.0;
        if (highlightMode === 'personas' && d.type === 'persona') return 1.0;
        
        return 0.3;  // Fade out non-highlighted nodes
      });
    
    // Add labels with better positioning
    node.append("text")
      .text(d => d.name)
      .attr("x", 0)
      .attr("y", d => {
        if (d.type === "theme") return 30 + (d.feedbackCount / 2);
        if (d.type === "persona") return 25;
        return 22; // Position feedback labels
      })
      .attr("text-anchor", "middle")
      .attr("font-size", d => d.type === "feedback" ? "10px" : "12px") // Smaller text for feedback
      .attr("fill", d => {
        // Make text more visible for highlighted nodes
        if (highlightMode !== 'none') {
          if (highlightMode === 'themes' && d.type === 'theme') return "#000";
          if (highlightMode === 'feedback' && d.type === 'feedback') return "#000";
          if (highlightMode === 'personas' && d.type === 'persona') return "#000";
          return "#999"; // Faded text for non-highlighted nodes
        }
        return "#333"; // Default text color
      })
      .attr("opacity", d => {
        // Match opacity with the node circles
        if (highlightMode === 'none') return 1.0;
        
        if (highlightMode === 'themes' && d.type === 'theme') return 1.0;
        if (highlightMode === 'feedback' && d.type === 'feedback') return 1.0;
        if (highlightMode === 'personas' && d.type === 'persona') return 1.0;
        
        return 0.3;
      });
    
    // Add title for tooltip that shows full feedback text
    node.append("title")
      .text(d => d.type === "feedback" ? d.title : d.name);
    
    // Run a few ticks before adding listener to get nodes in better positions
    for (let i = 0; i < 20; i++) {
      simulation.tick();
    }
    
    // Update link positions immediately with node positions from simulation ticks
    link
      .attr("x1", d => {
        const source = nodes.find(n => n.id === d.source);
        return source ? source.x : 0;
      })
      .attr("y1", d => {
        const source = nodes.find(n => n.id === d.source);
        return source ? source.y : 0;
      })
      .attr("x2", d => {
        const target = nodes.find(n => n.id === d.target);
        return target ? target.x : 0;
      })
      .attr("y2", d => {
        const target = nodes.find(n => n.id === d.target);
        return target ? target.y : 0;
      });
    
    // Now add the tick listener for ongoing updates
    simulation.on("tick", () => {
      link
        .attr("x1", d => {
          // Handle both ID and object references
          const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
          const source = nodes.find(n => n.id === sourceId);
          return source ? source.x : 0;
        })
        .attr("y1", d => {
          const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
          const source = nodes.find(n => n.id === sourceId);
          return source ? source.y : 0;
        })
        .attr("x2", d => {
          const targetId = typeof d.target === 'object' ? d.target.id : d.target;
          const target = nodes.find(n => n.id === targetId);
          return target ? target.x : 0;
        })
        .attr("y2", d => {
          const targetId = typeof d.target === 'object' ? d.target.id : d.target;
          const target = nodes.find(n => n.id === targetId);
          return target ? target.y : 0;
        });
      
      node.attr("transform", d => `translate(${d.x}, ${d.y})`);
    });
    
    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      
      // Only release the node if it's not the selected node
      if (!selectedNode || selectedNode.id !== d.id) {
        d.fx = null;
        d.fy = null;
      }
    }
    
    // Center the view
    svg.call(zoom.transform, d3.zoomIdentity.translate(
      dimensions.width / 2 - dimensions.width * 0.5,
      dimensions.height / 2 - dimensions.height * 0.5
    ).scale(0.8));
    
    // Clean up on unmount
    return () => {
      simulation.stop();
    };
  }, [dimensions, graphData, highlightMode, selectedNode]);

  // Recalculate feedback counts based on graph connections
  const recalculateFeedbackCounts = useCallback(() => {
    // Create a map to track feedback counts
    const feedbackCounts = {
      themes: {},
      personas: {},
      features: {}
    };
    
    // Count feedback for each node type based on connections
    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      const sourceNode = graphData.nodes.find(n => n.id === sourceId);
      const targetNode = graphData.nodes.find(n => n.id === targetId);
      
      if (!sourceNode || !targetNode) return;
      
      // Count theme connections
      if (sourceNode.type === "theme" && targetNode.type === "feedback") {
        feedbackCounts.themes[sourceNode.id] = (feedbackCounts.themes[sourceNode.id] || 0) + 1;
      }
      else if (targetNode.type === "theme" && sourceNode.type === "feedback") {
        feedbackCounts.themes[targetNode.id] = (feedbackCounts.themes[targetNode.id] || 0) + 1;
      }
      
      // Count persona connections
      if (sourceNode.type === "persona" && targetNode.type === "feedback") {
        feedbackCounts.personas[sourceNode.id] = (feedbackCounts.personas[sourceNode.id] || 0) + 1;
      }
      else if (targetNode.type === "persona" && sourceNode.type === "feedback") {
        feedbackCounts.personas[targetNode.id] = (feedbackCounts.personas[targetNode.id] || 0) + 1;
      }
    });
    
    // Update node feedback counts
    const updatedNodes = graphData.nodes.map(node => {
      if (node.type === "theme" && feedbackCounts.themes[node.id]) {
        return { ...node, feedbackCount: feedbackCounts.themes[node.id] };
      }
      if (node.type === "persona" && feedbackCounts.personas[node.id]) {
        return { ...node, feedbackCount: feedbackCounts.personas[node.id] };
      }
      return node;
    });
    
    // Update the graph data
    setGraphData(prevData => ({
      ...prevData,
      nodes: updatedNodes
    }));
  }, [graphData]);

  // Import data from file with more robust processing
  const importData = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    console.log("Starting import from file:", file.name);
    
    // Use our async utility function
    importFeedbackData(file)
      .then(async (importedData) => {
        console.log("Processed import data:", importedData);
        
        // Process feedback nodes for sentiment analysis
        const feedbackNodes = importedData.nodes.filter(node => 
          node.type === 'feedback' && !node.sentiment
        );
        
        // If we have feedback nodes without sentiment, analyze them
        if (feedbackNodes.length > 0) {
          setIsAIProcessing(true);
          
          // Process in batches to avoid overwhelming the API
          const batchSize = 5;
          for (let i = 0; i < feedbackNodes.length; i += batchSize) {
            const batch = feedbackNodes.slice(i, i + batchSize);
            
            // Process each node in the batch
            await Promise.all(batch.map(async (node) => {
              try {
                const feedbackText = node.text || node.fullText || node.name || "";
                const result = await analyzeSentiment(feedbackText);
                node.sentiment = result.sentiment;
              } catch (error) {
                console.warn(`Error analyzing sentiment for node ${node.id}:`, error);
                node.sentiment = "Neutral"; // Fallback
              }
            }));
          }
          
          setIsAIProcessing(false);
        }
        
        // Ensure node structure is compatible with visualization
        const processedNodes = importedData.nodes.map(node => {
          // Make sure each node has the essential properties
          return {
            ...node,
            // Ensure these critical properties exist
            id: node.id,
            name: node.name || node.label || "Unnamed",
            type: node.type || "theme",
            // Add appropriate properties based on type
            ...(node.type === 'theme' ? { feedbackCount: node.feedbackCount || 5 } : {}),
            ...(node.type === 'feature' ? { priority: node.priority || 'Medium' } : {})
          };
        });
        
        // Update analytics data with sentiment distribution
        const sentimentCounts = processedNodes
          .filter(node => node.type === 'feedback' && node.sentiment)
          .reduce((counts, node) => {
            counts[node.sentiment] = (counts[node.sentiment] || 0) + 1;
            return counts;
          }, {});
        
        const updatedAnalytics = {
          ...importedData.analytics,
          sentimentDistribution: sentimentCounts
        };
        
        setGraphData({ 
          nodes: processedNodes, 
          links: importedData.links || []
        });
        setInsights(importedData.insights || []);
        setAnalyticsData(updatedAnalytics);
        setLoading(false);
        
        // Reset any selections and force a re-center
        setSelectedNode(null);
        setTimeout(() => {
          if (zoomRef.current) {
            const svg = d3.select(svgRef.current);
            const svgWidth = svg.node().getBoundingClientRect().width;
            const svgHeight = svg.node().getBoundingClientRect().height;
            
            svg.transition()
              .duration(750)
              .call(zoomRef.current.transform, 
                d3.zoomIdentity
                  .translate(svgWidth / 2, svgHeight / 2)
                  .scale(0.8)
              );
          }
        }, 300);
        
        // Set hasImportedData to true when data is successfully imported
        setHasImportedData(true);
      })
      .catch(error => {
        console.error("Error importing feedback data:", error);
        setError(`Error importing file: ${error.message || "Unknown error"}`);
        setLoading(false);
      });
  }, []); // Remove fitToScreen from dependencies

  // Helper function for keyword-based theme classification (used as fallback)
  const mockClassifyFeedback = (text) => {
    // Simple keyword-based classification
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('crash') || lowerText.includes('error') || lowerText.includes('bug')) {
      return { theme: 'Stability Issues' };
    } else if (lowerText.includes('slow') || lowerText.includes('performance') || lowerText.includes('timeout')) {
      return { theme: 'Performance' };
    } else if (lowerText.includes('mobile') || lowerText.includes('app') || lowerText.includes('phone')) {
      return { theme: 'Mobile Experience' };
    } else if (lowerText.includes('ui') || lowerText.includes('interface') || lowerText.includes('design') || 
              lowerText.includes('layout') || lowerText.includes('look')) {
      return { theme: 'User Interface' };
    } else if (lowerText.includes('report') || lowerText.includes('dashboard')) {
      return { theme: 'Reporting & Analytics' };
    } else if (lowerText.includes('export') || lowerText.includes('excel') || lowerText.includes('pdf')) {
      return { theme: 'Data Export & Import' };
    } else if (lowerText.includes('search') || lowerText.includes('filter') || lowerText.includes('find')) {
      return { theme: 'Search & Navigation' };
    }
    
    return { theme: 'General Feedback' };
  };
  
  // Helper function for feature generation (used as fallback)
  const mockGenerateFeatureIdeas = (theme) => {
    // Generate simple feature ideas based on theme
    if (theme === 'Stability Issues') {
      return [{ 
        name: 'Crash Prevention & Recovery', 
        priority: 'High'
      }];
    } else if (theme === 'Performance') {
      return [{ 
        name: 'Performance Optimization', 
        priority: 'High'
      }];
    } else if (theme === 'Mobile Experience') {
      return [{ 
        name: 'Responsive Design Overhaul', 
        priority: 'High'
      }];
    } else if (theme === 'User Interface') {
      return [{ 
        name: 'UI Modernization', 
        priority: 'Medium'
      }];
    } else if (theme === 'Reporting & Analytics') {
      return [{ 
        name: 'Custom Report Builder', 
        priority: 'High'
      }];
    } else if (theme === 'Data Export & Import') {
      return [{ 
        name: 'Enhanced Export Options', 
        priority: 'High'
      }];
    } else {
      return [{ 
        name: 'User Experience Improvements', 
        priority: 'Medium'
      }];
    }
  };

  // Process imported feedback with enhanced reliability
  const processImportedFeedback = useCallback((feedbackItems) => {
    if (!feedbackItems || feedbackItems.length === 0) {
      setLoading(false);
      return;
    }
    
    console.log(`Processing ${feedbackItems.length} feedback items...`);
    setIsAIProcessing(true);
    
    // Create a new graph structure
    const newGraph = {
      nodes: [],
      links: []
    };
    
    // Track created nodes to avoid duplicates
    const nodeMap = {
      personas: {},
      themes: {},
      features: {}
    };
    
    // Step 1: First create all persona nodes from feedback
    console.log("Creating persona nodes...");
    feedbackItems.forEach(item => {
      if (!item.user_role) return;
      
      if (!nodeMap.personas[item.user_role]) {
        const personaId = `persona-${Date.now()}-${Object.keys(nodeMap.personas).length}`;
        const personaNode = {
          id: personaId,
          name: item.user_role,
          type: "persona",
          feedbackCount: 1
        };
        
        newGraph.nodes.push(personaNode);
        nodeMap.personas[item.user_role] = personaNode;
        console.log(`Created persona node: ${item.user_role}`);
      } else {
        // Increment feedback count for existing persona
        nodeMap.personas[item.user_role].feedbackCount += 1;
      }
    });
    
    // Step 2: Process each feedback to identify themes
    // Use chunks to avoid overwhelming the system
    console.log("Processing feedback to identify themes...");
    const processChunks = async () => {
      const chunkSize = 5; // Process 5 at a time
      const chunks = [];
      
      // Split feedback into chunks
      for (let i = 0; i < feedbackItems.length; i += chunkSize) {
        chunks.push(feedbackItems.slice(i, i + chunkSize));
      }
      
      // Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`Processing chunk ${i+1} of ${chunks.length}...`);
        
        // Process items in this chunk
        for (const item of chunk) {
          if (!item.text || !item.user_role) continue;
          
          try {
            // Attempt to use the AI classification service
            console.log(`Classifying: "${item.text.substring(0, 30)}..."`);
            let result;
            
            try {
              // Try AI service first
              result = await classifyFeedback(item.text);
              console.log("AI classification result:", result);
            } catch (aiError) {
              // If AI fails, use fallback classification
              console.warn("AI classification failed, using fallback:", aiError);
              result = mockClassifyFeedback(item.text);
              console.log("Fallback classification result:", result);
            }
            
            if (result && result.theme) {
              // Create or update theme node
              if (!nodeMap.themes[result.theme]) {
                const themeId = `theme-${Date.now()}-${Object.keys(nodeMap.themes).length}`;
                const themeNode = {
                  id: themeId,
                  name: result.theme,
                  type: "theme",
                  feedbackCount: 1
                };
                
                newGraph.nodes.push(themeNode);
                nodeMap.themes[result.theme] = themeNode;
                console.log(`Created theme node: ${result.theme}`);
              } else {
                // Increment existing theme's feedback count
                nodeMap.themes[result.theme].feedbackCount += 1;
              }
              
              // Connect persona to theme
              const personaNode = nodeMap.personas[item.user_role];
              const themeNode = nodeMap.themes[result.theme];
              
              if (personaNode && themeNode) {
                // Check if link already exists
                const linkExists = newGraph.links.some(link => 
                  (link.source === personaNode.id && link.target === themeNode.id) ||
                  (link.source === themeNode.id && link.target === personaNode.id)
                );
                
                if (!linkExists) {
                  newGraph.links.push({
                    source: personaNode.id,
                    target: themeNode.id,
                    strength: 0.7
                  });
                  console.log(`Connected persona "${personaNode.name}" to theme "${themeNode.name}"`);
                }
              }
            }
          } catch (err) {
            console.error("Error processing feedback item:", err);
          }
        }
        
        // Update graph data every chunk to show progress
        if (i < chunks.length - 1) {
          setGraphData({...newGraph});
          // Small delay to allow UI to update
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Step 3: Generate feature suggestions for top themes
      console.log("Generating feature suggestions...");
      const significantThemes = Object.values(nodeMap.themes)
        .filter(theme => theme.feedbackCount >= 2)
        .sort((a, b) => b.feedbackCount - a.feedbackCount)
        .slice(0, 5); // Top 5 themes
      
      console.log(`Found ${significantThemes.length} significant themes for feature generation`);
      
      for (const theme of significantThemes) {
        try {
          // Get feedback related to this theme
          const relatedFeedback = feedbackItems.filter(item => {
            const text = item.text.toLowerCase();
            return text.includes(theme.name.toLowerCase());
          }).map(item => item.text);
          
          // Generate feature ideas
          console.log(`Generating features for theme "${theme.name}" with ${relatedFeedback.length} feedback items`);
          let featureIdeas;
          
          try {
            // Try AI service first
            featureIdeas = await generateFeatureIdeas(theme.name, relatedFeedback);
            console.log("AI generated feature ideas:", featureIdeas);
          } catch (aiError) {
            // If AI fails, use mock generation
            console.warn("AI feature generation failed, using fallback:", aiError);
            featureIdeas = mockGenerateFeatureIdeas(theme.name, relatedFeedback);
            console.log("Fallback feature ideas:", featureIdeas);
          }
          
          if (featureIdeas && featureIdeas.length > 0) {
            // Create feature nodes
            for (const idea of featureIdeas) {
              const featureId = `feature-${Date.now()}-${Object.keys(nodeMap.features).length}`;
              const featureNode = {
                id: featureId,
                name: idea.name,
                description: idea.description || "",
                type: "feature",
                priority: idea.priority || "Medium"
              };
              
              newGraph.nodes.push(featureNode);
              nodeMap.features[featureNode.name] = featureNode;
              console.log(`Created feature: ${featureNode.name}`);
              
              // Link feature to theme
              newGraph.links.push({
                source: theme.id,
                target: featureId,
                strength: 0.8
              });
              
              // Find personas connected to this theme
              newGraph.links.forEach(link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                
                if ((sourceId === theme.id || targetId === theme.id)) {
                  const personaId = sourceId === theme.id ? targetId : sourceId;
                  const personaNode = newGraph.nodes.find(n => n.id === personaId && n.type === 'persona');
                  
                  if (personaNode) {
                    // Link persona to feature
                    const existingLink = newGraph.links.some(l => 
                      (l.source === personaId && l.target === featureId) ||
                      (l.source === featureId && l.target === personaId)
                    );
                    
                    if (!existingLink) {
                      newGraph.links.push({
                        source: personaId,
                        target: featureId,
                        strength: 0.6
                      });
                      console.log(`Connected persona "${personaNode.name}" to feature "${featureNode.name}"`);
                    }
                  }
                }
              });
            }
          }
        } catch (err) {
          console.error(`Error generating features for theme "${theme.name}":`, err);
        }
      }
      
      // Ensure we have at least some features if none were generated
      if (newGraph.nodes.filter(n => n.type === 'feature').length === 0) {
        console.log("No features were generated - creating fallback features");
        
        // Create a fallback feature for each major theme
        for (const theme of significantThemes.slice(0, 3)) {
          const featureId = `feature-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          const featureNode = {
            id: featureId,
            name: `${theme.name} Improvement`,
            type: "feature",
            priority: theme.feedbackCount >= 5 ? "High" : "Medium",
            fallback: true
          };
          
          newGraph.nodes.push(featureNode);
          console.log(`Created fallback feature: ${featureNode.name}`);
          
          // Link to theme
          newGraph.links.push({
            source: theme.id,
            target: featureId,
            strength: 0.8
          });
        }
      }
      
      // Final graph update
      console.log("Finalizing graph...");
      console.log("Final graph has:", newGraph.nodes.length, "nodes and", newGraph.links.length, "links");
      console.log("Nodes by type:", {
        personas: newGraph.nodes.filter(n => n.type === 'persona').length,
        themes: newGraph.nodes.filter(n => n.type === 'theme').length,
        features: newGraph.nodes.filter(n => n.type === 'feature').length
      });
      
      setGraphData(newGraph);
      
      // Pre-compute positions for better visualization
      setTimeout(() => {
        if (simulationRef.current) {
          simulationRef.current.stop();
          
          // Create a temporary simulation to calculate positions
          const tempSimulation = d3.forceSimulation(newGraph.nodes)
            .force("link", d3.forceLink(newGraph.links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(dimensions.width/2, dimensions.height/2))
            .force("collide", d3.forceCollide(40));
          
          // Run several ticks to get a good initial layout
          for (let i = 0; i < 100; i++) {
            tempSimulation.tick();
          }
          
          tempSimulation.stop();
        }
        
        setIsAIProcessing(false);
        setLoading(false);
        console.log("Import processing complete");
      }, 100);
    };
    
    // Start the processing
    processChunks().catch(err => {
      console.error("Error in processChunks:", err);
      setError("Error processing feedback. Please try again.");
      setIsAIProcessing(false);
      setLoading(false);
    });
  }, [dimensions]);

  // Update the handleNodeClick function to properly handle all node types with complete data
  const handleNodeClick = useCallback((node, event) => {
    if (!node) return;
    
    // Prevent text selection and set up the node selection
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
    }
    
    console.log("Node clicked, setting panel visible:", node);
    setSelectedNode(node);
    
    // Find connected nodes
    const connectedLinks = graphData.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return sourceId === node.id || targetId === node.id;
    });
    
    const connectedNodeIds = connectedLinks.map(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return sourceId === node.id ? targetId : sourceId;
    });
    
    const connectedNodes = graphData.nodes.filter(n => connectedNodeIds.includes(n.id));
    
    if (node.type === 'theme') {
      // Theme node view - collect all relevant data
      const connectedFeedback = connectedNodes.filter(n => n.type === "feedback" || n.type.startsWith("feedback"));
      const connectedPersonas = connectedNodes.filter(n => n.type === "persona");
      
      const sentimentCount = {
        Positive: connectedFeedback.filter(n => n.sentiment === "Positive" || n.type === "feedback-positive").length,
        Negative: connectedFeedback.filter(n => n.sentiment === "Negative" || n.type === "feedback-negative").length,
        Neutral: connectedFeedback.filter(n => n.sentiment === "Neutral" || 
                                            (n.type !== "feedback-positive" && n.type !== "feedback-negative")).length
      };
      
      // Example feedback for this theme (get full text)
      const exampleFeedback = connectedFeedback.slice(0, 3).map(f => ({
        text: f.fullText || f.originalText || f.completeText || f.text || f.content || 
              f.feedback || f.description || f.name || "",
        sentiment: f.sentiment || 
                  (f.type === "feedback-positive" ? "Positive" : 
                   f.type === "feedback-negative" ? "Negative" : "Neutral")
      }));
      
      setAIInsights({
        isThemeView: true,
        isPersonaView: false,
        isFeedbackView: false,
        theme: node.name,
        feedbackCount: connectedFeedback.length,
        sentimentDistribution: sentimentCount,
        personas: connectedPersonas.map(p => p.name),
        exampleFeedback: exampleFeedback,
        insights: node.insights || insights.filter(i => i.relatedThemes?.includes(node.name)) || []
      });
    } 
    else if (node.type === 'persona') {
      // Persona node view - collect all related themes and feedback
      const connectedThemes = connectedNodes.filter(n => n.type === "theme");
      
      // Find all feedback indirectly connected to this persona through themes
      let relatedFeedback = [];
      
      // First get directly connected feedback
      const directFeedback = connectedNodes.filter(n => n.type === "feedback" || n.type.startsWith("feedback"));
      relatedFeedback = [...directFeedback];
      
      // Then get feedback connected through themes
      for (const theme of connectedThemes) {
        const themeLinks = graphData.links.filter(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          return (sourceId === theme.id || targetId === theme.id);
        });
        
        const themeFeedbackIds = themeLinks.map(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          const connectedId = sourceId === theme.id ? targetId : sourceId;
          return connectedId;
        });
        
        const themeFeedback = graphData.nodes.filter(n => 
          themeFeedbackIds.includes(n.id) && 
          (n.type === "feedback" || n.type.startsWith("feedback")) && 
          !relatedFeedback.some(f => f.id === n.id)
        );
        
        relatedFeedback = [...relatedFeedback, ...themeFeedback];
      }
      
      // Get sentiment distribution for this persona's feedback
      const sentimentCount = {
        Positive: relatedFeedback.filter(n => n.sentiment === "Positive" || n.type === "feedback-positive").length,
        Negative: relatedFeedback.filter(n => n.sentiment === "Negative" || n.type === "feedback-negative").length,
        Neutral: relatedFeedback.filter(n => n.sentiment === "Neutral" || 
                                         (n.type !== "feedback-positive" && n.type !== "feedback-negative")).length
      };
      
      // Example feedback for this persona (get full text)
      const exampleFeedback = relatedFeedback.slice(0, 3).map(f => ({
        text: f.fullText || f.originalText || f.completeText || f.text || f.content || 
              f.feedback || f.description || f.name || "",
        sentiment: f.sentiment || 
                  (f.type === "feedback-positive" ? "Positive" : 
                   f.type === "feedback-negative" ? "Negative" : "Neutral")
      }));
      
      setAIInsights({
        isThemeView: false,
        isPersonaView: true,
        isFeedbackView: false,
        persona: node.name,
        feedbackCount: relatedFeedback.length,
        themes: connectedThemes.map(t => t.name),
        sentimentDistribution: sentimentCount,
        exampleFeedback: exampleFeedback,
        insights: node.insights || insights.filter(i => i.relatedPersonas?.includes(node.name)) || []
      });
    }
    else if (node.type.startsWith('feedback') || node.type === 'feedback') {
      console.log("Feedback node clicked:", node);
      
      // Use node.title as the full feedback text
      let fullText = node.title || "No feedback text available";
      
      // If node.title isn't available, try other sources
      if (!node.title) {
        // Try standard fields
        fullText = node.text || node.content || node.name || "No feedback text available";
        
        // Check feedbackItems if available
        if (feedbackItems && feedbackItems.length > 0) {
          const matchingItem = feedbackItems.find(item => item.id === node.id);
          if (matchingItem && matchingItem.text) {
            fullText = matchingItem.text;
          }
        }
      }
      
      // Get related themes
      const relatedThemes = connectedNodes
        .filter(n => n.type === "theme")
        .map(n => n.name);
      
      setAIInsights({
        isThemeView: false,
        isPersonaView: false,
        isFeedbackView: true,
        text: fullText,
        sentiment: node.sentiment || 'Neutral',
        persona: node.user_role || node.persona || node.user || "Unknown user",
        themes: node.theme ? [node.theme] : (node.themes || relatedThemes || []),
        id: node.id || "Unknown",
        date: node.timestamp || node.date || "Unknown",
        insights: node.insights || []
      });
    }
    
    // Make sure to call this at the end of all node types
    setShowAIInsightsPanel(true);
  }, [graphData, feedbackItems]);

  // Zoom control functions
  const zoomIn = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const currentTransform = d3.zoomTransform(svg.node());
    
    svg.transition()
      .duration(300)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity
          .translate(currentTransform.x, currentTransform.y)
          .scale(currentTransform.k * 1.3)
      );
  }, []);

  const zoomOut = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const currentTransform = d3.zoomTransform(svg.node());
    
    svg.transition()
      .duration(300)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity
          .translate(currentTransform.x, currentTransform.y)
          .scale(currentTransform.k / 1.3)
      );
  }, []);

  const centerView = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    
    const svg = d3.select(svgRef.current);
    
    // Calculate the center point
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    // Create a transform that centers the view
    const transform = d3.zoomIdentity
      .translate(centerX, centerY)
      .scale(1)
      .translate(-centerX, -centerY);
    
    // Apply the transform with a smooth transition
    svg.transition()
      .duration(750)
      .call(zoomRef.current.transform, transform);
  }, [dimensions]);

  const fitToScreen = useCallback(() => {
    if (!svgRef.current || !zoomRef.current || !graphData.nodes.length) return;
    
    const svg = d3.select(svgRef.current);
    
    // Find the bounds of all nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    graphData.nodes.forEach(node => {
      if (!node.x || !node.y) return;
      
      if (node.x < minX) minX = node.x;
      if (node.y < minY) minY = node.y;
      if (node.x > maxX) maxX = node.x;
      if (node.y > maxY) maxY = node.y;
    });
    
    // If we don't have valid bounds, center view instead
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
      centerView();
      return;
    }
    
    // Add padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    // Calculate width and height of the content
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    // Calculate scale to fit the content
    const scale = Math.min(
      dimensions.width / contentWidth,
      dimensions.height / contentHeight,
      2 // Maximum scale factor
    ) * 0.9; // 90% to add some margin
    
    // Calculate the center of the content
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    // Create a transform that centers and scales the content
    const transform = d3.zoomIdentity
      .translate(dimensions.width / 2, dimensions.height / 2)
      .scale(scale)
      .translate(-centerX, -centerY);
    
    // Apply the transform with a smooth transition
    svg.transition()
      .duration(750)
      .call(zoomRef.current.transform, transform);
  }, [dimensions, graphData.nodes, centerView]);

  // Toggle mini-map visibility
  const toggleMiniMap = useCallback(() => {
    setShowMiniMap(!showMiniMap);
  }, [showMiniMap]);

  const handleDataImported = (importedData) => {
    if (importedData) {
      setGraphData({ 
        nodes: importedData.nodes || [], 
        links: importedData.links || [] 
      });
      setInsights(importedData.insights || []);
    }
  };

  // Add these functions back
  const exportData = useCallback(() => {
    // Prepare complete export with all AI data
    const completeExportData = {
      // Include the graph structure
      nodes: graphData.nodes.map(node => ({
        ...node,
        // If there are any D3-specific properties that shouldn't be exported, filter them out here
        fx: undefined,
        fy: undefined,
        index: undefined,
        vx: undefined,
        vy: undefined,
        x: undefined,
        y: undefined
      })),
      links: graphData.links.map(link => {
        // Ensure links use id strings rather than object references
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
        return {
          source: sourceId,
          target: targetId,
          strength: link.strength || 0.5
        };
      }),
      
      // Include all AI-generated insights
      insights: insights || [],
      
      // Include analytics data with sentiment distribution
      analytics: {
        ...analyticsData,
        // Ensure sentiment distribution is included
        sentimentDistribution: analyticsData?.sentimentDistribution || {
          Positive: graphData.nodes.filter(n => n.type === 'feedback' && n.sentiment === 'Positive').length,
          Negative: graphData.nodes.filter(n => n.type === 'feedback' && n.sentiment === 'Negative').length,
          Neutral: graphData.nodes.filter(n => n.type === 'feedback' && n.sentiment === 'Neutral').length
        },
        exportDate: new Date().toISOString(),
        exportVersion: "1.0"
      },
      
      // Include raw feedback data if available
      feedbackItems: feedbackItems || []
    };

    // Convert to JSON string with nice formatting
    const dataStr = JSON.stringify(completeExportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'feedback-insights-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    console.log("Exported data with AI insights and sentiment analysis");
  }, [graphData, insights, analyticsData, feedbackItems]);

  // Reset to initial data
  const resetVisualization = useCallback(() => {
    if (window.confirm("Are you sure you want to reset? This will remove all custom data.")) {
      setGraphData(initialData);
      setSelectedNode(null);
      setHighlightMode('none');
    }
  }, []);

  // Function to handle when data is imported
  const handleDataImport = (data) => {
    // Your existing import handling logic
    // ...
    
    // Set hasImportedData to true when data is successfully imported
    setHasImportedData(true);
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-50">
        <div className="text-2xl text-blue-800 mb-4">Loading Insights Network...</div>
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-50">
        <div className="text-2xl text-red-800 mb-4">Error Loading Data</div>
        <div className="text-gray-600">{error}</div>
        <button 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Then in the return statement, replace the existing AI panel with the improved one
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showSearchResults={showSearchResults}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        setSelectedNode={setSelectedNode}
        handleNodeClick={handleNodeClick}
        setShowSearchResults={setShowSearchResults}
        graphData={graphData}
      />
      
      {/* Rest of the component without the header duplicate */}
      <div className="flex flex-col h-full">
        {/* Controls and visualization tools */}
        <div className="bg-white p-4 border-b border-gray-200">
          {/* Data controls */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Data:</span>
              <button 
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                onClick={exportData}
              >
                Export
              </button>
              <label className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm cursor-pointer">
                Import
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={importData}
                />
              </label>
              <button 
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                onClick={resetVisualization}
              >
                Reset
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">View:</span>
              <button 
                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                onClick={centerView}
              >
                Center View
              </button>
              <button 
                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                onClick={toggleMiniMap}
              >
                {showMiniMap ? 'Hide Mini-Map' : 'Show Mini-Map'}
              </button>
              <button 
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                onClick={fitToScreen}
                title="Fit all nodes to screen"
              >
                Fit to Screen
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Highlight:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setHighlightMode('none')}
                  className={`px-3 py-1 text-sm rounded ${
                    highlightMode === 'none' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  None
                </button>
                <button
                  onClick={() => setHighlightMode('themes')}
                  className={`px-3 py-1 text-sm rounded ${
                    highlightMode === 'themes' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Themes
                </button>
                <button
                  onClick={() => setHighlightMode('feedback')}
                  className={`px-3 py-1 text-sm rounded ${
                    highlightMode === 'feedback' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Feedback
                </button>
                <button
                  onClick={() => setHighlightMode('personas')}
                  className={`px-3 py-1 text-sm rounded ${
                    highlightMode === 'personas' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  User Role
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main visualization container */}
        <div className="flex flex-1 relative">
          <div 
            ref={containerRef} 
            className="flex-1 bg-gray-50 p-4 transition-all duration-300"
            style={{
              marginRight: showAIInsightsPanel && !isPanelCollapsed ? `${panelWidth}px` : '0',
              minHeight: '500px'
            }}
          >
            <svg 
              ref={svgRef} 
              width="100%" 
              height="100%"
              className="border border-gray-200 rounded-lg bg-white shadow-inner w-full h-full"
              style={{ minHeight: '500px' }}
              onClick={() => setSelectedNode(null)}
            />
            
            {/* Getting Started Instructions - displayed when no data imported */}
            {!hasImportedData && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-5 max-w-2xl mx-auto">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Getting Started</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="font-bold text-sm">1</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-blue-600 mb-1">Prepare Your Data</h3>
                        <p className="text-gray-700 text-sm mb-1">Format your feedback as JSON following this structure:</p>
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`{
  "id": "feedback-id",
  "text": "The actual feedback comment text",
  "user_role": "User role (e.g. Admin)",
  "timestamp": "xxx"
}`}
                        </pre>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="font-bold text-sm">2</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-blue-600 mb-1">Import Your Data</h3>
                        <p className="text-gray-700 text-sm">Click the "Import" button to upload your file</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="font-bold text-sm">3</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-blue-600 mb-1">Visualize</h3>
                        <p className="text-gray-700 text-sm">Use "Center View," "Mini-Map," or "Fit to Screen" to explore your feedback</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="font-bold text-sm">4</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-blue-600 mb-1">Analyze</h3>
                        <p className="text-gray-700 text-sm">Apply filters with Highlight, Themes, and User Role to discover patterns</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Add Legend */}
            <Legend 
              colorScale={colorScale} 
              showSentiment={true} 
              sentimentColors={{
                positive: colorScale("feedback-positive"),
                neutral: colorScale("feedback-neutral"),
                negative: colorScale("feedback-negative")
              }}
            />
            
            {/* Zoom controls */}
            <div className="absolute bottom-8 right-8 flex flex-col bg-white rounded-lg shadow p-2 space-y-2 z-10">
              <button 
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full"
                onClick={zoomIn}
              >
                <span className="text-xl">+</span>
              </button>
              <button 
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full"
                onClick={zoomOut}
              >
                <span className="text-xl">-</span>
              </button>
              <button 
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full"
                onClick={fitToScreen}
              >
                <span className="text-xl">⊡</span>
              </button>
            </div>
          </div>
          
          {/* AI Insights Panel if enabled */}
          {showAIInsightsPanel && aiInsights && (
            <div 
              className={`fixed right-0 top-0 bottom-0 bg-white shadow-lg z-40 transition-all duration-300 flex`}
              style={{ 
                width: isPanelCollapsed ? '50px' : `${panelWidth}px`,
                maxWidth: '40%'
              }}
            >
              {/* Panel collapse/expand control */}
              <div className={`flex flex-col ${isPanelCollapsed ? 'w-full' : ''}`}>
                {/* Collapse toggle button */}
                <button 
                  className="absolute left-0 top-16 bg-white shadow-md p-2 rounded-l-md"
                  onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                >
                  {isPanelCollapsed ? 
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg> : 
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  }
                </button>
                
                {!isPanelCollapsed && (
                  <div className="flex flex-col h-full">
                    {/* Panel header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-200">
                      <h2 className="text-lg font-bold text-gray-800">AI Insights</h2>
                      <button 
                        className="text-gray-500 hover:text-red-500"
                        onClick={() => setShowAIInsightsPanel(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Scrollable content section */}
                    <div className="flex-1 overflow-y-auto p-4 pb-20">
                      {/* Loading indicator */}
                      {isAIProcessing && (
                        <div className="flex justify-center items-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                      
                      {/* Error message */}
                      {aiError && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
                          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                          <p className="text-red-700">{aiError}</p>
                        </div>
                      )}
                      
                      {/* AI Insights Content */}
                      {!isAIProcessing && !aiError && (
                        <div className="space-y-6">
                          {/* Sentiment Overview Section with proper spacing */}
                          {analyticsData && analyticsData.sentimentDistribution && (
                            <div className="mb-6 pb-6 border-b border-gray-200">
                              <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Sentiment Overview</h3>
                              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <div className="flex items-center justify-around mb-2">
                                  <div className="text-center">
                                    <div className="text-green-500 text-2xl font-bold">
                                      {analyticsData.sentimentDistribution?.Positive || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">Positive</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-red-500 text-2xl font-bold">
                                      {analyticsData.sentimentDistribution?.Negative || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">Negative</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-gray-500 text-2xl font-bold">
                                      {analyticsData.sentimentDistribution?.Neutral || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">Neutral</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Theme Node Details */}
                          {aiInsights.isThemeView && (
                            <div className="mb-6">
                              <div className="flex items-center mb-4">
                                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: colorScale('theme') }}></div>
                                <h3 className="text-lg font-semibold text-gray-700">Theme: {aiInsights.theme}</h3>
                              </div>
                              
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                  <div className="text-center p-1 bg-white rounded border border-gray-200">
                                    <div className="text-xl font-bold text-blue-600">{aiInsights.feedbackCount || 0}</div>
                                    <div className="text-[10px] text-gray-500 whitespace-normal overflow-hidden">Feedback</div>
                                  </div>
                                  
                                  <div className="text-center p-1 bg-white rounded border border-gray-200">
                                    <div className="text-xl font-bold text-purple-600">{aiInsights.personas?.length || 0}</div>
                                    <div className="text-[10px] text-gray-500 whitespace-normal overflow-hidden">Users</div>
                                  </div>
                                  
                                  <div className="text-center p-1 bg-white rounded border border-gray-200">
                                    <div className="text-xl font-bold text-teal-600">
                                      {Math.round(((aiInsights.sentimentDistribution?.Positive || 0) / 
                                        Math.max(1, ((aiInsights.sentimentDistribution?.Positive || 0) + 
                                         (aiInsights.sentimentDistribution?.Negative || 0) + 
                                         (aiInsights.sentimentDistribution?.Neutral || 0)))) * 100) || 0}%
                                    </div>
                                    <div className="text-[10px] text-gray-500 whitespace-normal overflow-hidden">Positive</div>
                                  </div>
                                </div>
                                
                                {/* Sentiment mini-chart */}
                                {aiInsights.sentimentDistribution && aiInsights.feedbackCount > 0 && (
                                  <div className="mb-4">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Sentiment Distribution</div>
                                    <div className="flex h-6 rounded-full overflow-hidden">
                                      <div 
                                        className="bg-green-500" 
                                        style={{ 
                                          width: `${(aiInsights.sentimentDistribution.Positive / Math.max(1, aiInsights.feedbackCount)) * 100}%` 
                                        }}
                                      ></div>
                                      <div 
                                        className="bg-red-500" 
                                        style={{ 
                                          width: `${(aiInsights.sentimentDistribution.Negative / Math.max(1, aiInsights.feedbackCount)) * 100}%` 
                                        }}
                                      ></div>
                                      <div 
                                        className="bg-gray-400" 
                                        style={{ 
                                          width: `${(aiInsights.sentimentDistribution.Neutral / Math.max(1, aiInsights.feedbackCount)) * 100}%` 
                                        }}
                                      ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                      <div>{aiInsights.sentimentDistribution.Positive} Positive</div>
                                      <div>{aiInsights.sentimentDistribution.Negative} Negative</div>
                                      <div>{aiInsights.sentimentDistribution.Neutral} Neutral</div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Associated User Roles */}
                                {aiInsights.personas && aiInsights.personas.length > 0 && (
                                  <div className="mb-4">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Associated User Roles</div>
                                    <div className="flex flex-wrap gap-2">
                                      {aiInsights.personas.map((persona, idx) => (
                                        <div key={idx} className="bg-orange-50 text-orange-800 px-3 py-1 rounded-full text-sm">
                                          {persona}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Example Feedback */}
                                {aiInsights.exampleFeedback && aiInsights.exampleFeedback.length > 0 && (
                                  <div>
                                    <div className="text-sm font-medium text-gray-700 mb-2">Example Feedback</div>
                                    <div className="space-y-3">
                                      {aiInsights.exampleFeedback.map((item, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                                          <p className="text-sm text-gray-700 italic mb-2">"{item.text}"</p>
                                          <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                                            item.sentiment === 'Positive' ? 'bg-green-100 text-green-800' : 
                                            item.sentiment === 'Negative' ? 'bg-red-100 text-red-800' : 
                                            'bg-gray-100 text-gray-700'
                                          }`}>
                                            {item.sentiment}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Persona Node Details */}
                          {aiInsights.isPersonaView && (
                            <div className="mb-6">
                              <div className="flex items-center mb-4">
                                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: colorScale('persona') }}></div>
                                <h3 className="text-lg font-semibold text-gray-700">User Role: {aiInsights.persona}</h3>
                              </div>
                              
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                  <div className="text-center p-1 bg-white rounded border border-gray-200">
                                    <div className="text-xl font-bold text-blue-600">{aiInsights.feedbackCount || 0}</div>
                                    <div className="text-[10px] text-gray-500 whitespace-normal overflow-hidden">Feedback</div>
                                  </div>
                                  
                                  <div className="text-center p-1 bg-white rounded border border-gray-200">
                                    <div className="text-xl font-bold text-purple-600">{aiInsights.themes?.length || 0}</div>
                                    <div className="text-[10px] text-gray-500 whitespace-normal overflow-hidden">Themes</div>
                                  </div>
                                  
                                  <div className="text-center p-1 bg-white rounded border border-gray-200">
                                    <div className="text-xl font-bold text-teal-600">
                                      {Math.round(((aiInsights.sentimentDistribution?.Positive || 0) / 
                                        Math.max(1, ((aiInsights.sentimentDistribution?.Positive || 0) + 
                                         (aiInsights.sentimentDistribution?.Negative || 0) + 
                                         (aiInsights.sentimentDistribution?.Neutral || 0)))) * 100) || 0}%
                                    </div>
                                    <div className="text-[10px] text-gray-500 whitespace-normal overflow-hidden">Positive</div>
                                  </div>
                                </div>
                                
                                {/* Sentiment mini-chart */}
                                {aiInsights.sentimentDistribution && aiInsights.feedbackCount > 0 && (
                                  <div className="mb-4">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Sentiment Distribution</div>
                                    <div className="flex h-6 rounded-full overflow-hidden">
                                      <div 
                                        className="bg-green-500" 
                                        style={{ 
                                          width: `${(aiInsights.sentimentDistribution.Positive / Math.max(1, aiInsights.feedbackCount)) * 100}%` 
                                        }}
                                      ></div>
                                      <div 
                                        className="bg-red-500" 
                                        style={{ 
                                          width: `${(aiInsights.sentimentDistribution.Negative / Math.max(1, aiInsights.feedbackCount)) * 100}%` 
                                        }}
                                      ></div>
                                      <div 
                                        className="bg-gray-400" 
                                        style={{ 
                                          width: `${(aiInsights.sentimentDistribution.Neutral / Math.max(1, aiInsights.feedbackCount)) * 100}%` 
                                        }}
                                      ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                      <div>{aiInsights.sentimentDistribution.Positive} Positive</div>
                                      <div>{aiInsights.sentimentDistribution.Negative} Negative</div>
                                      <div>{aiInsights.sentimentDistribution.Neutral} Neutral</div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Associated Themes */}
                                {aiInsights.themes && aiInsights.themes.length > 0 && (
                                  <div className="mb-4">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Associated Themes</div>
                                    <div className="flex flex-wrap gap-2">
                                      {aiInsights.themes.map((theme, idx) => (
                                        <div key={idx} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                                          {theme}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Example Feedback */}
                                {aiInsights.exampleFeedback && aiInsights.exampleFeedback.length > 0 && (
                                  <div>
                                    <div className="text-sm font-medium text-gray-700 mb-2">Example Feedback</div>
                                    <div className="space-y-3">
                                      {aiInsights.exampleFeedback.map((item, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                                          <p className="text-sm text-gray-700 italic mb-2">"{item.text}"</p>
                                          <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                                            item.sentiment === 'Positive' ? 'bg-green-100 text-green-800' : 
                                            item.sentiment === 'Negative' ? 'bg-red-100 text-red-800' : 
                                            'bg-gray-100 text-gray-700'
                                          }`}>
                                            {item.sentiment}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Feedback Node Details */}
                          {aiInsights.isFeedbackView && (
                            <div className="mb-6">
                              <div className="flex items-center mb-4">
                                <div className="w-4 h-4 rounded-full mr-2" style={{ 
                                  backgroundColor: colorScale(`feedback-${aiInsights.sentiment?.toLowerCase() || 'neutral'}`) 
                                }}></div>
                                <h3 className="text-lg font-semibold text-gray-700">Feedback Item</h3>
                              </div>
                              
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                {/* Full feedback text */}
                                <div className="mb-4">
                                  <div className="text-sm font-medium text-gray-700 mb-2">Feedback</div>
                                  <div className="bg-white p-4 rounded border border-gray-200 max-h-80 overflow-y-auto">
                                    <p className="text-gray-700 whitespace-pre-wrap break-words text-sm leading-relaxed">
                                      {aiInsights.text}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Sentiment */}
                                <div className="mb-4">
                                  <div className="text-sm font-medium text-gray-700 mb-2">Sentiment</div>
                                  <div className={`inline-block px-3 py-1 rounded-full ${
                                    aiInsights.sentiment === 'Positive' ? 'bg-green-100 text-green-800' : 
                                    aiInsights.sentiment === 'Negative' ? 'bg-red-100 text-red-800' : 
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {aiInsights.sentiment || 'Neutral'}
                                  </div>
                                </div>
                                
                                {/* Associated User */}
                                {aiInsights.persona && (
                                  <div className="mb-4">
                                    <div className="text-sm font-medium text-gray-700 mb-2">From User</div>
                                    <div className="bg-orange-50 text-orange-800 px-3 py-1 rounded-full text-sm inline-block">
                                      {aiInsights.persona}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Related Themes */}
                                {aiInsights.themes && aiInsights.themes.length > 0 && (
                                  <div className="mb-4">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Related Themes</div>
                                    <div className="flex flex-wrap gap-2">
                                      {aiInsights.themes.map((theme, idx) => (
                                        <div key={idx} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                                          {theme}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Metadata */}
                                <div className="flex justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
                                  <div>ID: {aiInsights.id || 'Unknown'}</div>
                                  <div>Date: {aiInsights.date || 'Unknown'}</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Key Insights Section */}
                          {aiInsights.insights && aiInsights.insights.length > 0 && (
                            <div className="mb-8">
                              <h3 className="text-lg font-semibold text-gray-700 mb-3">Key Insights</h3>
                              <div className="space-y-4">
                                {aiInsights.insights.map(insight => (
                                  <div key={insight.id || Math.random()} className="bg-blue-50 p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                                    <h4 className="font-medium text-gray-800 mb-1">{insight.title}</h4>
                                    <p className="text-gray-700 text-sm">{insight.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* AI Insights button */}
          {insights.length > 0 && !showAIInsightsPanel && (
            <button
              onClick={() => {
                setAIInsights({ results: [], insights: insights });
                setShowAIInsightsPanel(true);
              }}
              className="fixed bottom-8 left-8 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700"
            >
              View AI Insights ({insights.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserResearchNetwork;
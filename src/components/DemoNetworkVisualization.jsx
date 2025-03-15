import React, { useEffect, useRef } from 'react';

const DemoNetworkVisualization = ({ data }) => {
  const svgRef = useRef(null);
  
  // Transform our sample data into a format suitable for visualization
  const prepareVisualizationData = (data) => {
    // Create nodes from themes and roles
    const nodes = [
      // Central feedback node
      { id: 'feedback', label: 'Feedback', type: 'feedback', radius: 30, color: '#3182CE' },
      
      // Theme nodes
      ...Object.entries(data.themeDistribution).map(([name, value], i) => ({
        id: `theme-${i}`,
        label: name,
        type: 'theme',
        value,
        radius: 15 + (value / 2),
        color: '#38A169'
      })),
      
      // Role nodes
      ...Object.entries(data.roleDistribution).map(([name, value], i) => ({
        id: `role-${i}`,
        label: name,
        type: 'role',
        value,
        radius: 15 + (value / 2),
        color: '#DD6B20'
      })),
      
      // Sentiment nodes
      ...Object.entries(data.sentimentDistribution).map(([name, value], i) => ({
        id: `sentiment-${i}`,
        label: name,
        type: 'sentiment',
        value,
        radius: 10 + (value / 2),
        color: name === 'Positive' ? '#4CAF50' : name === 'Negative' ? '#F44336' : '#2196F3'
      }))
    ];
    
    // Create links between nodes
    const links = [
      // Connect themes to central node
      ...nodes.filter(n => n.type === 'theme').map(node => ({
        source: 'feedback',
        target: node.id,
        value: node.value
      })),
      
      // Connect roles to central node
      ...nodes.filter(n => n.type === 'role').map(node => ({
        source: 'feedback',
        target: node.id,
        value: node.value
      })),
      
      // Connect sentiments to central node
      ...nodes.filter(n => n.type === 'sentiment').map(node => ({
        source: 'feedback',
        target: node.id,
        value: node.value
      }))
    ];
    
    return { nodes, links };
  };
  
  useEffect(() => {
    if (!data || !svgRef.current) return;
    
    const { nodes, links } = prepareVisualizationData(data);
    const svg = svgRef.current;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    
    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    
    // Position nodes in a layout
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Position central node in center
    const centralNode = nodes.find(n => n.id === 'feedback');
    centralNode.x = centerX;
    centralNode.y = centerY;
    
    // Position other nodes in a circle around the central node
    const themeNodes = nodes.filter(n => n.type === 'theme');
    const roleNodes = nodes.filter(n => n.type === 'role');
    const sentimentNodes = nodes.filter(n => n.type === 'sentiment');
    
    // Themes at top
    themeNodes.forEach((node, i) => {
      const angle = (Math.PI / (themeNodes.length + 1)) * (i + 1);
      node.x = centerX + Math.cos(angle) * 120;
      node.y = centerY - Math.sin(angle) * 120;
    });
    
    // Roles at bottom left
    roleNodes.forEach((node, i) => {
      const angle = Math.PI + (Math.PI / 3) * (i / (roleNodes.length - 1));
      node.x = centerX + Math.cos(angle) * 120;
      node.y = centerY - Math.sin(angle) * 120;
    });
    
    // Sentiments at bottom right
    sentimentNodes.forEach((node, i) => {
      const angle = (2 * Math.PI) - (Math.PI / 3) * (i / (sentimentNodes.length - 1));
      node.x = centerX + Math.cos(angle) * 120;
      node.y = centerY - Math.sin(angle) * 120;
    });
    
    // Draw links first (so they're behind nodes)
    links.forEach(link => {
      const source = nodes.find(n => n.id === link.source);
      const target = nodes.find(n => n.id === link.target);
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', source.x);
      line.setAttribute('y1', source.y);
      line.setAttribute('x2', target.x);
      line.setAttribute('y2', target.y);
      line.setAttribute('stroke', '#CBD5E0');
      line.setAttribute('stroke-width', Math.min(2, Math.max(1, link.value / 10)));
      line.setAttribute('opacity', '0.6');
      svg.appendChild(line);
    });
    
    // Draw all nodes
    nodes.forEach(node => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      // Node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', node.x);
      circle.setAttribute('cy', node.y);
      circle.setAttribute('r', node.radius);
      circle.setAttribute('fill', node.color);
      group.appendChild(circle);
      
      // Node label
      if (node.type === 'feedback' || node.type === 'theme' || node.type === 'role') {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', node.type === 'feedback' ? '12px' : '10px');
        text.textContent = node.type === 'feedback' ? 'Feedback' : 
                           node.label.length > 10 ? node.label.substring(0, 10) + '...' : node.label;
        group.appendChild(text);
      }
      
      svg.appendChild(group);
    });
    
  }, [data]);
  
  return (
    <svg 
      ref={svgRef}
      width="100%" 
      height="100%" 
      style={{
        display: 'block',
        background: '#EBF8FF',
        borderRadius: '8px'
      }}
    ></svg>
  );
};

export default DemoNetworkVisualization; 
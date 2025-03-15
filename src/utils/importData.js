import { v4 as uuidv4 } from 'uuid';
import { batchClassifyFeedback, generateFeatureIdeas, batchAnalyzeSentiment } from '../services/openaiService';

/**
 * Process feedback data to extract themes and create visualization data
 * @param {Array} feedbackData - The raw feedback data array
 * @returns {Promise<Object>} Object containing nodes, links, and AI insights
 */
export const processFeedbackData = async (feedbackData) => {
  if (!feedbackData || !Array.isArray(feedbackData)) {
    console.error('Invalid feedback data format');
    return { nodes: [], links: [], insights: [] };
  }

  // Ensure all feedback items have an id and text field
  const cleanedFeedbackData = feedbackData.map((item, index) => {
    // More robust text extraction
    const text = extractTextContent(item);
    
    return {
      id: item.id || `feedback-${index}`,
      text: text,
      user_role: item.user_role || item.role || item.userRole || "",
      timestamp: item.timestamp || item.date || item.created_at || new Date().toISOString()
    };
  });

  // Use OpenAI to classify feedback into themes
  console.log("Classifying feedback with OpenAI...");
  const themeMap = await batchClassifyFeedback(cleanedFeedbackData);
  
  // Use OpenAI to analyze sentiment of feedback
  console.log("Analyzing sentiment with OpenAI...");
  const sentimentMap = await batchAnalyzeSentiment(cleanedFeedbackData);
  
  // Extract unique themes from the classification results
  const themes = [...new Set(Object.values(themeMap))].filter(Boolean);
  console.log("Extracted themes:", themes);
  
  // Create nodes for each feedback item, theme, and persona
  const nodes = createNodes(cleanedFeedbackData, themes, themeMap, sentimentMap);
  
  // Create links between feedback and related themes/personas
  const links = createLinks(cleanedFeedbackData, themes, nodes, themeMap);
  
  // Generate AI insights from the feedback
  const insights = await generateInsights(cleanedFeedbackData, themes, themeMap, sentimentMap);
  
  // Generate additional analytical data for the AI panel
  const analyticsData = generateAnalytics(cleanedFeedbackData, themeMap, sentimentMap);
  
  return { nodes, links, insights, analytics: analyticsData };
};

/**
 * Create nodes for visualization
 */
const createNodes = (feedbackData, themes, themeMap, sentimentMap) => {
  const nodes = [];
  
  // Create theme nodes
  themes.forEach(theme => {
    // Check if theme is defined before using toLowerCase
    if (theme) {
      // Count how many feedback items belong to this theme
      const themeCount = Object.values(themeMap).filter(t => t === theme).length;
      
      nodes.push({
        id: `theme-${theme.replace(/\s+/g, '-').toLowerCase()}`,
        type: 'theme',
        name: theme,
        label: theme,
        feedbackCount: themeCount,
        value: 25 + (themeCount * 2), // Scale size based on feedback count
        group: 'theme'
      });
    }
  });
  
  // Create persona nodes from feedback user_roles
  const uniqueRoles = [...new Set(feedbackData.map(item => item.user_role).filter(Boolean))];
  uniqueRoles.forEach(role => {
    // Check if role is defined before using toLowerCase
    if (role) {
      // Count how many feedback items are from this persona
      const roleCount = feedbackData.filter(item => item.user_role === role).length;
      
      // Calculate sentiment for this role
      const roleFeedback = feedbackData.filter(item => item.user_role === role);
      let positiveCount = 0, negativeCount = 0, neutralCount = 0;
      
      roleFeedback.forEach(feedback => {
        const sentiment = sentimentMap[feedback.id];
        if (sentiment === 'Positive') positiveCount++;
        else if (sentiment === 'Negative') negativeCount++;
        else neutralCount++;
      });
      
      nodes.push({
        id: `persona-${role.replace(/\s+/g, '-').toLowerCase()}`,
        type: 'persona',
        name: role,
        label: role,
        feedbackCount: roleCount,
        value: 20,
        group: 'persona',
        sentimentStats: {
          positive: positiveCount,
          negative: negativeCount,
          neutral: neutralCount
        }
      });
    }
  });
  
  // Create feedback nodes with more aggressive text truncation
  feedbackData.forEach(feedback => {
    // Ensure text exists before trying to truncate it
    const feedbackText = feedback.text || "";
    
    // Create a more meaningful label for the node
    const nodeLabel = feedbackText.trim() ? 
      truncateText(feedbackText, 20) : 
      `Feedback ${feedback.id.substring(0, 8)}`;
    
    nodes.push({
      id: feedback.id,
      type: 'feedback',
      name: nodeLabel,
      label: nodeLabel,
      title: feedbackText || "No text available", // Full text stored for tooltip/details
      value: 15,
      group: feedback.user_role || 'unknown',
      timestamp: feedback.timestamp,
      user_role: feedback.user_role,
      theme: themeMap[feedback.id] || 'Unclassified',
      sentiment: sentimentMap[feedback.id] || 'Neutral'
    });
  });
  
  return nodes;
};

/**
 * Create links between nodes
 */
const createLinks = (feedbackData, themes, nodes, themeMap) => {
  const links = [];
  
  // Connect feedback to relevant themes based on AI classification
  feedbackData.forEach(feedback => {
    const feedbackTheme = themeMap[feedback.id];
    if (feedbackTheme) {
      const themeId = `theme-${feedbackTheme.replace(/\s+/g, '-').toLowerCase()}`;
      links.push({
        id: uuidv4(),
        source: feedback.id,
        target: themeId,
        strength: 0.8
      });
    }
    
    // Connect feedback to persona (user role)
    if (feedback.user_role) {
      const personaId = `persona-${feedback.user_role.replace(/\s+/g, '-').toLowerCase()}`;
      links.push({
        id: uuidv4(),
        source: feedback.id,
        target: personaId,
        strength: 0.7
      });
    }
  });
  
  // Connect personas to themes they have feedback about
  const personaNodes = nodes.filter(node => node.type === 'persona');
  const themeNodes = nodes.filter(node => node.type === 'theme');
  
  personaNodes.forEach(persona => {
    // Find all feedback from this persona
    const personaFeedback = feedbackData.filter(f => 
      f.user_role && f.user_role.replace(/\s+/g, '-').toLowerCase() === persona.id.replace('persona-', '')
    );
    
    // Find themes associated with this feedback
    const personaThemes = new Set();
    personaFeedback.forEach(feedback => {
      const theme = themeMap[feedback.id];
      if (theme) personaThemes.add(theme);
    });
    
    // Connect persona to each theme
    themeNodes.forEach(theme => {
      const themeName = theme.name;
      if (personaThemes.has(themeName)) {
        links.push({
          id: uuidv4(),
          source: persona.id,
          target: theme.id,
          strength: 0.6 // Slightly weaker connection
        });
      }
    });
  });
  
  return links;
};

/**
 * Generate comprehensive analytics from feedback data
 */
export const generateAnalytics = (feedbackData, themeMap, sentimentMap) => {
  console.log("Generating analytics for", feedbackData.length, "feedback items");
  
  // Overall sentiment distribution
  const sentimentCounts = { Positive: 0, Negative: 0, Neutral: 0 };
  Object.values(sentimentMap).forEach(sentiment => {
    sentimentCounts[sentiment]++;
  });
  
  // Theme distribution
  const themeCounts = {};
  Object.values(themeMap).forEach(theme => {
    themeCounts[theme] = (themeCounts[theme] || 0) + 1;
  });
  
  // Sentiment by theme
  const sentimentByTheme = {};
  feedbackData.forEach(feedback => {
    const theme = themeMap[feedback.id];
    const sentiment = sentimentMap[feedback.id];
    
    if (!theme || !sentiment) return;
    
    if (!sentimentByTheme[theme]) {
      sentimentByTheme[theme] = { Positive: 0, Negative: 0, Neutral: 0 };
    }
    
    sentimentByTheme[theme][sentiment]++;
  });
  
  // User role distribution
  const roleCounts = {};
  feedbackData.forEach(feedback => {
    if (feedback.user_role) {
      roleCounts[feedback.user_role] = (roleCounts[feedback.user_role] || 0) + 1;
    }
  });
  
  // Sentiment by user role
  const sentimentByRole = {};
  feedbackData.forEach(feedback => {
    const role = feedback.user_role;
    const sentiment = sentimentMap[feedback.id];
    
    if (!role || !sentiment) return;
    
    if (!sentimentByRole[role]) {
      sentimentByRole[role] = { Positive: 0, Negative: 0, Neutral: 0 };
    }
    
    sentimentByRole[role][sentiment]++;
  });
  
  // Feedback over time (if timestamp is available)
  const feedbackByDate = {};
  feedbackData.forEach(feedback => {
    if (feedback.timestamp) {
      const date = new Date(feedback.timestamp).toISOString().split('T')[0];
      feedbackByDate[date] = (feedbackByDate[date] || 0) + 1;
    }
  });
  
  return {
    totalFeedback: feedbackData.length,
    sentimentDistribution: sentimentCounts,
    themeDistribution: themeCounts,
    sentimentByTheme,
    roleDistribution: roleCounts,
    sentimentByRole,
    feedbackByDate
  };
};

/**
 * Generate AI insights from feedback
 */
const generateInsights = async (feedbackData, themes, themeMap, sentimentMap) => {
  const insights = [];
  
  // Create a map of themes to feedback
  const themeToFeedback = {};
  feedbackData.forEach(feedback => {
    const theme = themeMap[feedback.id];
    if (theme) {
      if (!themeToFeedback[theme]) {
        themeToFeedback[theme] = [];
      }
      themeToFeedback[theme].push({
        text: feedback.text,
        sentiment: sentimentMap[feedback.id] || 'Neutral'
      });
    }
  });
  
  // Generate insights for top themes
  const topThemes = Object.entries(themeToFeedback)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5) // Show more themes
    .map(([theme]) => theme);
  
  // Add overview insight first
  const sentimentCounts = { Positive: 0, Negative: 0, Neutral: 0 };
  Object.values(sentimentMap).forEach(sentiment => {
    sentimentCounts[sentiment]++;
  });
  
  insights.push({
    id: uuidv4(),
    title: 'Feedback Overview',
    description: `Analyzed ${feedbackData.length} pieces of feedback across ${themes.length} key themes. Overall sentiment: ${sentimentCounts.Positive} positive, ${sentimentCounts.Negative} negative, and ${sentimentCounts.Neutral} neutral feedback items.`
  });
  
  for (const theme of topThemes) {
    const feedbackItems = themeToFeedback[theme];
    const feedbackCount = feedbackItems.length;
    
    // Calculate sentiment distribution for this theme
    const themeSentiment = { Positive: 0, Negative: 0, Neutral: 0 };
    feedbackItems.forEach(item => {
      themeSentiment[item.sentiment]++;
    });
    
    // Find representative examples of both positive and negative feedback
    const positiveFeedback = feedbackItems.filter(item => item.sentiment === 'Positive')[0]?.text;
    const negativeFeedback = feedbackItems.filter(item => item.sentiment === 'Negative')[0]?.text;
    
    const examples = [];
    if (positiveFeedback) examples.push(`Positive: "${truncateText(positiveFeedback, 60)}"`);
    if (negativeFeedback) examples.push(`Negative: "${truncateText(negativeFeedback, 60)}"`);
    
    const sentimentSummary = `Sentiment: ${themeSentiment.Positive} positive, ${themeSentiment.Negative} negative, ${themeSentiment.Neutral} neutral`;
    
    // Add theme-specific insight with sentiment analysis
    insights.push({
      id: uuidv4(),
      title: `${theme}`,
      description: `${feedbackCount} feedback items were identified in this theme. ${sentimentSummary}. ${examples.length > 0 ? 'Examples include: ' + examples.join('; ') : ''}`,
      sentiment: themeSentiment,
      feedbackCount
    });
  }
  
  // Add role-based insight
  const roles = [...new Set(feedbackData.map(item => item.user_role).filter(Boolean))];
  if (roles.length > 0) {
    // Calculate sentiment by role
    const sentimentByRole = {};
    feedbackData.forEach(feedback => {
      const role = feedback.user_role;
      const sentiment = sentimentMap[feedback.id];
      
      if (!role || !sentiment) return;
      
      if (!sentimentByRole[role]) {
        sentimentByRole[role] = { Positive: 0, Negative: 0, Neutral: 0 };
      }
      
      sentimentByRole[role][sentiment]++;
    });
    
    // Find the role with the most negative sentiment
    let mostNegativeRole = '';
    let highestNegativePercentage = 0;
    
    Object.entries(sentimentByRole).forEach(([role, counts]) => {
      const total = counts.Positive + counts.Negative + counts.Neutral;
      const negativePercentage = counts.Negative / total;
      
      if (negativePercentage > highestNegativePercentage) {
        highestNegativePercentage = negativePercentage;
        mostNegativeRole = role;
      }
    });
    
    insights.push({
      id: uuidv4(),
      title: 'User Role Analysis',
      description: `Feedback came from ${roles.length} different user roles. ${mostNegativeRole ? `${mostNegativeRole} users expressed the most concerns, with ${Math.round(highestNegativePercentage * 100)}% negative feedback.` : ''}`
    });
  }
  
  return insights;
};

/**
 * Helper function to truncate text
 */
const truncateText = (text, maxLength) => {
  if (!text) return "No text";
  
  // Convert to string if not already
  const textStr = String(text);
  
  if (textStr.trim() === '') return "No text";
  if (textStr.length <= maxLength) return textStr;
  
  // For longer texts, try to find a good breaking point
  const breakPoint = textStr.lastIndexOf(' ', maxLength - 3);
  if (breakPoint > maxLength / 2) {
    return textStr.substring(0, breakPoint) + '...';
  }
  return textStr.substring(0, maxLength) + '...';
};

/**
 * Extract text content from various possible data structures
 */
const extractTextContent = (item) => {
  if (!item) return "";
  
  // Check for direct text property
  if (typeof item.text === 'string' && item.text.trim() !== '') {
    return item.text.trim();
  }
  
  // Check for content property
  if (typeof item.content === 'string' && item.content.trim() !== '') {
    return item.content.trim();
  }
  
  // Check for message property
  if (typeof item.message === 'string' && item.message.trim() !== '') {
    return item.message.trim();
  }
  
  // Check for feedback property
  if (typeof item.feedback === 'string' && item.feedback.trim() !== '') {
    return item.feedback.trim();
  }
  
  // Check if the item itself is a string
  if (typeof item === 'string' && item.trim() !== '') {
    return item.trim();
  }
  
  // Check for description property
  if (typeof item.description === 'string' && item.description.trim() !== '') {
    return item.description.trim();
  }
  
  // Check for comment property
  if (typeof item.comment === 'string' && item.comment.trim() !== '') {
    return item.comment.trim();
  }
  
  // If we have a body object with text
  if (item.body && typeof item.body.text === 'string' && item.body.text.trim() !== '') {
    return item.body.text.trim();
  }
  
  // Last resort: stringify any non-empty content
  for (const key in item) {
    if (typeof item[key] === 'string' && item[key].trim() !== '') {
      return item[key].trim();
    }
  }
  
  return "No feedback text available";
}

/**
 * Import and process JSON feedback data
 * @param {File|String} source - Either a File object or a JSON string
 * @returns {Promise} Promise that resolves to processed data
 */
export const importFeedbackData = async (source) => {
  try {
    let data;
    
    if (typeof source === 'string') {
      // If the source is a JSON string
      data = JSON.parse(source);
    } else if (source instanceof File) {
      // If the source is a File object
      const text = await readFileAsText(source);
      data = JSON.parse(text);
    } else {
      throw new Error('Invalid source type. Expected File or JSON string.');
    }
    
    // If the data is not an array but has a property that is an array
    if (!Array.isArray(data)) {
      // Look for a property that might contain the feedback array
      const possibleArrayProps = Object.keys(data).filter(key => Array.isArray(data[key]));
      
      if (possibleArrayProps.length > 0) {
        data = data[possibleArrayProps[0]];
      } else {
        throw new Error('Could not find feedback data array in the imported JSON.');
      }
    }
    
    // Process the data with AI classification
    return await processFeedbackData(data);
  } catch (error) {
    console.error('Error importing feedback data:', error);
    throw error;
  }
};

/**
 * Read a file as text
 */
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}; 
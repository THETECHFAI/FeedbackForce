import axios from 'axios';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// You'll need to set this in your environment variables
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

/**
 * Classify feedback text into themes using OpenAI
 * @param {string} feedbackText - The feedback text to classify
 * @returns {Promise<Object>} - An object containing the theme and confidence
 */
export const classifyFeedback = async (feedbackText) => {
  try {
    // Check if the API key is available
    if (!API_KEY) {
      console.warn('OpenAI API key is missing. Using fallback classification.');
      return mockClassifyFeedback(feedbackText);
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4', // Updated to GPT-4
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that categorizes user feedback into a single theme. Choose the most appropriate theme from: Performance, Usability, Design, Functionality, Data Visualization, Mobile Experience, Error Handling, or create a new appropriate theme if none of these fit well.'
          },
          {
            role: 'user',
            content: `Categorize this feedback into a single theme: "${feedbackText}". Respond with a JSON object with the format {"theme": "ThemeName", "confidence": 0.X} where confidence is a number between 0 and 1.`
          }
        ],
        temperature: 0.3, // Keeping as is for theme classification
        max_tokens: 100
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    // Parse the response to extract the theme
    const assistantMessage = response.data.choices[0].message.content;
    const match = assistantMessage.match(/\{.*\}/s);
    
    if (match) {
      return JSON.parse(match[0]);
    } else {
      throw new Error('Could not parse theme from OpenAI response');
    }
  } catch (error) {
    console.error('Error classifying feedback with OpenAI:', error);
    // Fall back to keyword-based classification
    return mockClassifyFeedback(feedbackText);
  }
};

/**
 * Process a batch of feedback texts to extract themes using OpenAI
 * @param {Array} feedbackItems - Array of feedback objects
 * @returns {Promise<Object>} - Mapping of feedback IDs to themes
 */
export const batchClassifyFeedback = async (feedbackItems) => {
  try {
    if (!API_KEY) {
      console.warn('OpenAI API key is missing. Using fallback classification.');
      return fallbackBatchClassify(feedbackItems);
    }

    // Prepare the batch prompt
    const feedbackTexts = feedbackItems.map((item, index) => 
      `Feedback ${index + 1}: "${item.text}"`
    ).join('\n\n');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4', // Updated to GPT-4
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that categorizes multiple pieces of user feedback into themes. Choose appropriate themes from: Performance, Usability, Design, Functionality, Data Visualization, Mobile Experience, Error Handling, or create new themes if needed.'
          },
          {
            role: 'user',
            content: `Categorize each of these feedback items into a single theme:\n\n${feedbackTexts}\n\nRespond with a JSON array with the format [{"feedbackIndex": 1, "theme": "ThemeName"}, {"feedbackIndex": 2, "theme": "ThemeName"}, ...] for each feedback item.`
          }
        ],
        temperature: 0.3, // Keeping as is for theme classification
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    // Parse the response to extract the themes
    const assistantMessage = response.data.choices[0].message.content;
    const match = assistantMessage.match(/\[\s*\{.*\}\s*\]/s);
    
    if (match) {
      const results = JSON.parse(match[0]);
      
      // Create a mapping of feedback ID to theme
      const themeMap = {};
      results.forEach(result => {
        const feedbackItem = feedbackItems[result.feedbackIndex - 1];
        if (feedbackItem) {
          themeMap[feedbackItem.id] = result.theme;
        }
      });
      
      return themeMap;
    } else {
      throw new Error('Could not parse themes from OpenAI response');
    }
  } catch (error) {
    console.error('Error batch classifying feedback with OpenAI:', error);
    // Fall back to individual keyword-based classification
    return fallbackBatchClassify(feedbackItems);
  }
};

/**
 * Generate feature ideas based on feedback themes
 * @param {string} theme - The theme to generate feature ideas for
 * @param {Array} relatedFeedback - Array of related feedback texts
 * @returns {Promise<Array>} - Array of feature ideas
 */
export const generateFeatureIdeas = async (theme, relatedFeedback = []) => {
  try {
    if (!API_KEY) {
      console.warn('OpenAI API key is missing. Using fallback feature generation.');
      return mockGenerateFeatureIdeas(theme);
    }

    // Prepare the context with related feedback
    let feedbackContext = '';
    if (relatedFeedback && relatedFeedback.length > 0) {
      feedbackContext = `Here are some examples of user feedback related to this theme:\n\n${relatedFeedback.slice(0, 5).join('\n\n')}`;
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4', // Updated to GPT-4
        messages: [
          {
            role: 'system',
            content: 'You are a product manager who generates practical feature ideas based on user feedback themes.'
          },
          {
            role: 'user',
            content: `Generate 2-3 feature ideas to address the "${theme}" theme in our application. ${feedbackContext}\n\nRespond with a JSON array of features with the format [{"name": "Feature Name", "description": "Brief description", "priority": "High/Medium/Low"}]`
          }
        ],
        temperature: 0.7, // Keeping as is for creativity
        max_tokens: 500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    // Parse the response to extract the feature ideas
    const assistantMessage = response.data.choices[0].message.content;
    const match = assistantMessage.match(/\[\s*\{.*\}\s*\]/s);
    
    if (match) {
      return JSON.parse(match[0]);
    } else {
      throw new Error('Could not parse feature ideas from OpenAI response');
    }
  } catch (error) {
    console.error('Error generating feature ideas with OpenAI:', error);
    // Fall back to mock feature generation
    return mockGenerateFeatureIdeas(theme);
  }
};

/**
 * Analyze sentiment of feedback text using OpenAI
 * @param {string} text - The feedback text to analyze
 * @returns {Promise<Object>} - An object containing sentiment and confidence
 */
export const analyzeSentiment = async (text) => {
  try {
    // Log the text being analyzed for debugging
    console.log("Analyzing sentiment for:", text);
    
    // Revised prompt with examples and improved rules
    const response = await fetch('/api/analyze-sentiment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text,
        instructions: `Analyze the sentiment of this user feedback with a focus on identifying implied positive or negative sentiments, even if not explicitly stated. Pay special attention to:
- Mentions of problems, issues, failures, or errors (e.g., "The system doesn't…", "I can't…")
- Words indicating frustration, dissatisfaction, or disappointment (e.g., "too slow", "difficult", "disappointing")
- Technical issues or errors (e.g., "It crashes", "The feature doesn’t work")
- Performance complaints (e.g., "It takes too long", "Slow response")
- Accessibility concerns (e.g., "The text is too small", "Hard to navigate")
- Feature requests or suggestions, which imply current functionality is insufficient (e.g., "It would be better if…", "I need to be able to…")
- Negative comparisons or unmet expectations (e.g., "Not as good as…", "I expected better")
- Explicit praise or satisfaction (e.g., "I love…", "Great job…")
- Positive comparisons or exceeded expectations (e.g., "Better than before", "Really helpful")

Feedback: "${text}"

Examples of NEGATIVE feedback:
- "The dashboard takes too long to load" (performance issue)
- "I can't find what I need" (usability problem)
- "Sometimes it works" (inconsistency issue)
- "The text is too small" (accessibility issue)
- "It would be better if we had more options" (suggestion implying inadequacy)
- "The app doesn't respect my settings" (functionality issue)
- "I need to be able to filter by date" (missing feature)
- "The search functionality is too basic" (usability complaint)

Examples of NEUTRAL feedback:
- "I use this feature daily" (purely descriptive, no judgment)
- "The system has many features" (objective statement)
- "I noticed the new update" (observation without clear positive/negative tone)

Examples of POSITIVE feedback:
- "I love how fast it is" (explicit praise)
- "Great improvement from before" (positive comparison)
- "The interface is intuitive and helpful" (positive evaluation)
- "This feature works perfectly for me" (explicit satisfaction)

Classification rules (prioritize correctly identifying negative and positive sentiments):
1. Classify as NEGATIVE if there are ANY complaints, issues, suggestions, or negative experiences, even if mildly stated (e.g., "It would be nice if…" implies a gap, so it’s NEGATIVE).
2. Classify as POSITIVE if there is EXPLICIT praise, satisfaction, or a positive comparison (e.g., "I love…", "Much better…").
3. Classify as NEUTRAL only if the feedback is ENTIRELY descriptive or observational with NO implied issues, suggestions, or praise (e.g., "The system has 5 features").
4. If the feedback contains both positive and negative elements, classify based on the dominant sentiment (e.g., "I love the design, but it’s too slow" is NEGATIVE due to the performance issue).
5. When in doubt between Neutral and another category, lean toward NEGATIVE if there’s any implied issue, or POSITIVE if there’s any implied praise. Avoid overusing Neutral.

Return only: "Negative", "Positive", or "Neutral" (with capital first letter only)`
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to analyze sentiment: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Sentiment analysis result:", data);
    
    // Ensure we have a valid sentiment value
    if (!data.sentiment || !['Positive', 'Negative', 'Neutral'].includes(data.sentiment)) {
      console.warn("Invalid sentiment received:", data.sentiment);
      // Default to Negative when in doubt
      return { sentiment: "Negative" };
    }
    
    return { sentiment: data.sentiment };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    // In case of error, default to Negative to be cautious
    return { sentiment: "Negative" };
  }
};

/**
 * Batch analyze sentiment for multiple feedback texts
 * @param {Array} feedbackItems - Array of feedback objects
 * @returns {Promise<Object>} - Mapping of feedback IDs to sentiment
 */
export const batchAnalyzeSentiment = async (feedbackItems) => {
  try {
    if (!API_KEY) {
      console.warn('OpenAI API key is missing. Using fallback sentiment analysis.');
      return fallbackBatchSentiment(feedbackItems);
    }

    // Prepare the batch prompt
    const feedbackTexts = feedbackItems.map((item, index) => 
      `Feedback ${index + 1}: "${item.text}"`
    ).join('\n\n');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4', // Updated to GPT-4
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that analyzes the sentiment of multiple pieces of user feedback. Classify each as Positive, Negative, or Neutral.'
          },
          {
            role: 'user',
            content: `Analyze the sentiment of each of these feedback items:\n\n${feedbackTexts}\n\nRespond with a JSON array with the format [{"feedbackIndex": 1, "sentiment": "Positive/Negative/Neutral"}, {"feedbackIndex": 2, "sentiment": "Positive/Negative/Neutral"}, ...] for each feedback item. Follow these instructions for classification:\n\nAnalyze the sentiment of this user feedback with a focus on identifying implied positive or negative sentiments, even if not explicitly stated. Pay special attention to:\n- Mentions of problems, issues, failures, or errors (e.g., "The system doesn't…", "I can't…")\n- Words indicating frustration, dissatisfaction, or disappointment (e.g., "too slow", "difficult", "disappointing")\n- Technical issues or errors (e.g., "It crashes", "The feature doesn’t work")\n- Performance complaints (e.g., "It takes too long", "Slow response")\n- Accessibility concerns (e.g., "The text is too small", "Hard to navigate")\n- Feature requests or suggestions, which imply current functionality is insufficient (e.g., "It would be better if…", "I need to be able to…")\n- Negative comparisons or unmet expectations (e.g., "Not as good as…", "I expected better")\n- Explicit praise or satisfaction (e.g., "I love…", "Great job…")\n- Positive comparisons or exceeded expectations (e.g., "Better than before", "Really helpful")\n\nExamples of NEGATIVE feedback:\n- "The dashboard takes too long to load" (performance issue)\n- "I can't find what I need" (usability problem)\n- "Sometimes it works" (inconsistency issue)\n- "The text is too small" (accessibility issue)\n- "It would be better if we had more options" (suggestion implying inadequacy)\n- "The app doesn't respect my settings" (functionality issue)\n- "I need to be able to filter by date" (missing feature)\n- "The search functionality is too basic" (usability complaint)\n\nExamples of NEUTRAL feedback:\n- "I use this feature daily" (purely descriptive, no judgment)\n- "The system has many features" (objective statement)\n- "I noticed the new update" (observation without clear positive/negative tone)\n\nExamples of POSITIVE feedback:\n- "I love how fast it is" (explicit praise)\n- "Great improvement from before" (positive comparison)\n- "The interface is intuitive and helpful" (positive evaluation)\n- "This feature works perfectly for me" (explicit satisfaction)\n\nClassification rules (prioritize correctly identifying negative and positive sentiments):\n1. Classify as NEGATIVE if there are ANY complaints, issues, suggestions, or negative experiences, even if mildly stated (e.g., "It would be nice if…" implies a gap, so it’s NEGATIVE).\n2. Classify as POSITIVE if there is EXPLICIT praise, satisfaction, or a positive comparison (e.g., "I love…", "Much better…").\n3. Classify as NEUTRAL only if the feedback is ENTIRELY descriptive or observational with NO implied issues, suggestions, or praise (e.g., "The system has 5 features").\n4. If the feedback contains both positive and negative elements, classify based on the dominant sentiment (e.g., "I love the design, but it’s too slow" is NEGATIVE due to the performance issue).\n5. When in doubt between Neutral and another category, lean toward NEGATIVE if there’s any implied issue, or POSITIVE if there’s any implied praise. Avoid overusing Neutral.`
          }
        ],
        temperature: 0.5, // Increased from 0.3 to 0.5
        max_tokens: 4000 // Increased to accommodate larger responses with GPT-4
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    // Parse the response to extract the sentiments
    const assistantMessage = response.data.choices[0].message.content;
    const match = assistantMessage.match(/\[\s*\{.*\}\s*\]/s);
    
    if (match) {
      const results = JSON.parse(match[0]);
      
      // Create a mapping of feedback ID to sentiment
      const sentimentMap = {};
      results.forEach(result => {
        const feedbackItem = feedbackItems[result.feedbackIndex - 1];
        if (feedbackItem) {
          sentimentMap[feedbackItem.id] = result.sentiment;
        }
      });
      
      return sentimentMap;
    } else {
      throw new Error('Could not parse sentiments from OpenAI response');
    }
  } catch (error) {
    console.error('Error batch analyzing sentiment with OpenAI:', error);
    return fallbackBatchSentiment(feedbackItems);
  }
};

/**
 * Fallback function for batch classification
 * @param {Array} feedbackItems - Array of feedback objects
 * @returns {Object} - Mapping of feedback IDs to themes
 */
const fallbackBatchClassify = (feedbackItems) => {
  const themeMap = {};
  feedbackItems.forEach(item => {
    const result = mockClassifyFeedback(item.text);
    themeMap[item.id] = result.theme;
  });
  return themeMap;
};

/**
 * Mock function for keyword-based theme classification (used as fallback)
 * @param {string} text - The feedback text to classify
 * @returns {Object} - An object containing the theme
 */
const mockClassifyFeedback = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('crash') || lowerText.includes('error') || lowerText.includes('bug')) {
    return { theme: 'Error Handling' };
  } else if (lowerText.includes('slow') || lowerText.includes('performance') || lowerText.includes('timeout') || lowerText.includes('load')) {
    return { theme: 'Performance' };
  } else if (lowerText.includes('mobile') || lowerText.includes('app') || lowerText.includes('phone')) {
    return { theme: 'Mobile Experience' };
  } else if (lowerText.includes('ui') || lowerText.includes('interface') || lowerText.includes('design') || 
            lowerText.includes('layout') || lowerText.includes('look')) {
    return { theme: 'Design' };
  } else if (lowerText.includes('report') || lowerText.includes('dashboard')) {
    return { theme: 'Data Visualization' };
  } else if (lowerText.includes('export') || lowerText.includes('excel') || lowerText.includes('pdf')) {
    return { theme: 'Data Export' };
  } else if (lowerText.includes('search') || lowerText.includes('filter') || lowerText.includes('find')) {
    return { theme: 'Navigation' };
  } else if (lowerText.includes('easy') || lowerText.includes('difficult') || lowerText.includes('confusing') || 
            lowerText.includes('intuitive') || lowerText.includes('user-friendly')) {
    return { theme: 'Usability' };
  } else if (lowerText.includes('feature') || lowerText.includes('function') || lowerText.includes('capability')) {
    return { theme: 'Functionality' };
  }
  
  return { theme: 'General Feedback' };
};

/**
 * Mock function for feature idea generation (used as fallback)
 * @param {string} theme - The theme to generate feature ideas for
 * @returns {Array} - Array of feature ideas
 */
const mockGenerateFeatureIdeas = (theme) => {
  switch (theme) {
    case 'Error Handling':
      return [
        { 
          name: 'Intelligent Error Recovery', 
          description: 'Automatically recover from common errors without user intervention',
          priority: 'High'
        },
        {
          name: 'User-Friendly Error Messages',
          description: 'Replace technical error messages with clear action items for users',
          priority: 'Medium'
        }
      ];
    case 'Performance':
      return [
        { 
          name: 'Optimized Data Loading', 
          description: 'Implement progressive loading and caching for faster dashboard performance',
          priority: 'High'
        },
        {
          name: 'Background Processing',
          description: 'Move heavy calculations to background threads to keep UI responsive',
          priority: 'Medium'
        }
      ];
    case 'Design':
      return [
        { 
          name: 'Redesigned Interface', 
          description: 'Streamline UI with modern design principles and improved visual hierarchy',
          priority: 'Medium'
        },
        {
          name: 'Customizable Themes',
          description: 'Allow users to personalize the interface with color themes and layouts',
          priority: 'Low'
        }
      ];
    default:
      return [
        { 
          name: `${theme} Improvements`, 
          description: `Address user feedback related to ${theme.toLowerCase()}`,
          priority: 'Medium'
        },
        {
          name: 'User Experience Enhancement',
          description: 'General improvements based on feedback analysis',
          priority: 'Medium'
        }
      ];
  }
};

/**
 * Fallback function for batch sentiment analysis
 */
const fallbackBatchSentiment = (feedbackItems) => {
  const sentimentMap = {};
  feedbackItems.forEach(item => {
    const result = mockAnalyzeSentiment(item.text);
    sentimentMap[item.id] = result.sentiment;
  });
  return sentimentMap;
};

/**
 * Mock function for sentiment analysis (used as fallback)
 */
const mockAnalyzeSentiment = (text) => {
  // Check if text exists before processing
  if (!text) {
    return { sentiment: 'Neutral', confidence: 0.5 };
  }
  
  const lowerText = text.toLowerCase();
  
  // Simple keyword-based sentiment analysis
  const positiveWords = ['love', 'great', 'good', 'amazing', 'excellent', 'awesome', 'fantastic', 'helpful', 'best', 'easy', 'like', 'impressed'];
  const negativeWords = ['bad', 'terrible', 'awful', 'poor', 'difficult', 'annoying', 'frustrating', 'hate', 'slow', 'worst', 'broken', 'issue', 'problem', 'error', 'bug'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  if (positiveCount > negativeCount) {
    return { sentiment: 'Positive', confidence: 0.7 };
  } else if (negativeCount > positiveCount) {
    return { sentiment: 'Negative', confidence: 0.7 };
  } else {
    return { sentiment: 'Neutral', confidence: 0.5 };
  }
};
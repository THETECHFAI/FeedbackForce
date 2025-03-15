import React from 'react';
import AppHeader from '../components/AppHeader';
import NetworkVisualization from '../components/NetworkVisualization';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const AboutPage = () => {
  // Sample data - similar to what's in DashboardPage
  const sampleData = {
    totalFeedback: 25,
    sentimentDistribution: { Positive: 10, Negative: 8, Neutral: 7 },
    themeDistribution: { 
      Performance: 8,
      "User Interface": 6,
      "Mobile Experience": 5,
      "Data Export": 4,
      "Search Functionality": 2
    },
    sentimentByTheme: {
      Performance: { Positive: 3, Negative: 4, Neutral: 1 },
      "User Interface": { Positive: 4, Negative: 1, Neutral: 1 },
      "Mobile Experience": { Positive: 1, Negative: 3, Neutral: 1 }
    },
    roleDistribution: {
      "Data Analyst": 10,
      "Marketing Manager": 8,
      "Field Sales": 7
    },
    sentimentByRole: {
      "Data Analyst": { Positive: 5, Negative: 3, Neutral: 2 },
      "Marketing Manager": { Positive: 3, Negative: 2, Neutral: 3 }
    },
    feedbackByDate: {
      "2023-01-01": 2,
      "2023-01-02": 3,
      "2023-01-03": 1,
      "2023-01-04": 4,
      "2023-01-05": 2
    }
  };

  // Format sentiment distribution data for pie chart
  const sentimentData = Object.entries(sampleData.sentimentDistribution).map(([name, value]) => ({
    name,
    value
  }));
  
  // Format theme distribution data for bar chart
  const themeData = Object.entries(sampleData.themeDistribution).map(([name, value]) => ({
    name,
    value
  }));
  
  // Format feedback by date for line chart
  const dateData = Object.entries(sampleData.feedbackByDate).map(([date, count]) => ({
    date,
    count
  }));
  
  // Colors for pie chart
  const SENTIMENT_COLORS = {
    Positive: '#4CAF50',
    Neutral: '#2196F3',
    Negative: '#F44336'
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader hideSearch={true} />
      
      <div className="container mx-auto px-4 py-8">
        
        {/* Blue Container for About Feedback Force & About Me */}
        <div 
          className="mb-8 p-6 rounded-lg text-white" 
          style={{ backgroundColor: '#2b6cb0' }}
        >
          <h1 className="text-3xl font-bold mb-2">About Feedback Force</h1>
          <p className="mb-4">
            I created Feedback Force as a research demo to explore how AI can transform messy, unstructured user feedback into clear, actionable insights. Traditional feedback analysis is slow, manual, and often overwhelming - this tool was designed to change that.
          </p>
          <p className="mb-4">
            By leveraging AI, Feedback Force automates the tedious process of gathering, categorizing, and visualizing feedback, helping product teams and creators spot trends, identify pain points, and make data-driven decisions - faster.
          </p>
          
          <hr className="my-4 border-white" />
          
          <h2 className="text-2xl font-bold mt-4 mb-2">About Me</h2>
          <p className="mb-4">
            Hi, I’m Faisal, a product leader exploring the future of AI-driven product creation. If you’re interested in how AI can accelerate product strategy, I’d love to connect.
          </p>
          <p>
            💬 Let’s talk:{' '}
            <a 
              href="mailto:hello@faisalshariff.io" 
              className="underline hover:text-gray-200"
            >
              Faisal Shariff
            </a>
            <br />
            📩 Learn more:{' '}
            <a 
              href="https://atomicbuilder.beehiiv.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline hover:text-gray-200"
            >
              The Atomic Builder
            </a>
          </p>
        </div>
        
        {/* App Section */}
        <div className="mb-12">
          <div className="flex items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">App Page</h2>
            <div className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Network Visualization
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            The App page provides an interactive network visualization that shows the relationships between 
            feedback, themes, user roles, and sentiment. You can explore connections, filter data, and discover patterns.
          </p>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Network Visualization</h3>
            
            <div className="aspect-w-4 aspect-h-3 h-96 mb-0">
              <NetworkVisualization />
            </div>
          </div>
        </div>
        
        {/* Dashboard Section */}
        <div>
          <div className="flex items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Page</h2>
            <div className="ml-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Analytics & Insights
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            The Dashboard page provides analytical charts and metrics that help you understand trends, 
            sentiment distribution, and key themes in your feedback data.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Sentiment Overview</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={SENTIMENT_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Understand the overall sentiment of your feedback at a glance. See the distribution of 
                positive, negative, and neutral feedback in your dataset.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Top Themes</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={themeData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 80,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Frequency" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Identify the most common themes in your feedback data. This helps you prioritize 
                which areas to focus on for improvements.
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Feedback Timeline</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dateData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Feedback Count"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Track feedback volume over time to identify trends and correlate with product releases, 
              marketing campaigns, or other events.
            </p>
          </div>
        </div>
        
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold mb-2">Ready to analyze your own data?</h2>
          <p className="mb-4">
            Import your feedback data and discover insights with our interactive visualization tools.
          </p>
          <a 
            href="/app" 
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started with Your Data
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
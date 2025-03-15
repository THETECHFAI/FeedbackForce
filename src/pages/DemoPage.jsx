import React from 'react';
import AppHeader from '../components/AppHeader';
import DemoNetworkVisualization from '../components/DemoNetworkVisualization';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const DemoPage = () => {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Demo</h1>
          <p className="text-gray-600 mb-6">
            Explore how Feedback Force visualizes and analyzes user feedback with this interactive demo. 
            This page shows sample data to demonstrate the platform's capabilities.
          </p>
          
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
              <div className="aspect-w-4 aspect-h-3 h-80">
                <DemoNetworkVisualization data={sampleData} />
              </div>
              <p className="mt-4 text-sm text-gray-600">
                This visualization shows the relationship between feedback, themes, and user roles.
                In the actual application, this visualization is fully interactive - you can click on nodes to see details, 
                drag nodes to rearrange the network, and filter data to focus on specific aspects.
              </p>
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
                          <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  See the distribution of positive, negative, and neutral sentiment across all your feedback.
                  This helps you quickly gauge overall customer satisfaction.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Top Themes</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={themeData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Count" fill="#3B82F6" />
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

export default DemoPage; 
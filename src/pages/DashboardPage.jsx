import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import AppHeader from '../components/AppHeader';

const DashboardPage = ({ graphData }) => {
  const [data, setData] = useState({
    sentimentDistribution: { Positive: 0, Negative: 0, Neutral: 0 },
    themeDistribution: {},
    sentimentByTheme: {},
    roleDistribution: {},
    sentimentByRole: {},
    feedbackByDate: {},
    totalFeedback: 0
  });

  useEffect(() => {
    console.log("Dashboard received graphData:", graphData);
    
    if (graphData && graphData.analytics) {
      console.log("Using actual analytics data with", graphData.analytics.totalFeedback, "items");
      setData(graphData.analytics);
    } else {
      console.log("Using sample data");
      // For testing - remove in production
      setData({
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
      });
    }
  }, [graphData]);

  // Format data for charts
  const sentimentData = [
    { name: 'Positive', value: data.sentimentDistribution?.Positive || 0 },
    { name: 'Negative', value: data.sentimentDistribution?.Negative || 0 },
    { name: 'Neutral', value: data.sentimentDistribution?.Neutral || 0 }
  ];

  // Sort theme data by value (descending)
  const themeData = Object.entries(data.themeDistribution || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Sort role data by value (descending) and take top 5
  const roleData = Object.entries(data.roleDistribution || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  
  // Create a new variable for all role data (without slicing)
  const allRoleData = Object.entries(data.roleDistribution || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Format time series data
  const timeSeriesData = Object.entries(data.feedbackByDate || {})
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Prepare sentiment by theme data
  const sentimentByThemeData = Object.entries(data.sentimentByTheme || {}).map(([theme, sentiments]) => ({
    theme,
    positive: sentiments.Positive || 0,
    negative: sentiments.Negative || 0,
    neutral: sentiments.Neutral || 0
  })).sort((a, b) => 
    (b.positive + b.negative + b.neutral) - (a.positive + a.negative + a.neutral)
  ).slice(0, 5);

  const COLORS = {
    Positive: '#38A169', // Green
    Negative: '#E53E3E', // Red
    Neutral: '#A0AEC0'   // Gray
  };
  const SENTIMENT_COLORS = {
    positive: '#38A169',
    negative: '#E53E3E',
    neutral: '#A0AEC0',
  };

  // Add this constant near your other color definitions
  const ROLE_COLORS = [
    '#4299E1', // Blue
    '#68D391', // Green
    '#F6AD55', // Orange
    '#9F7AEA', // Purple
    '#FC8181'  // Pink
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader hideSearch={true} />
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Feedback Analytics Dashboard</h1>
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Feedback</h2>
            <p className="text-3xl font-bold text-gray-800">{data.totalFeedback || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">Key Themes</h2>
            <p className="text-3xl font-bold text-gray-800">{Object.keys(data.themeDistribution || {}).length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">User Roles</h2>
            <p className="text-3xl font-bold text-gray-800">{Object.keys(data.roleDistribution || {}).length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">Positive Sentiment</h2>
            <p className="text-3xl font-bold text-green-600">
              {data.sentimentDistribution?.Positive ? 
                `${Math.round(data.sentimentDistribution.Positive / data.totalFeedback * 100)}%` : 
                '0%'}
            </p>
          </div>
        </div>
        
        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Sentiment Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Sentiment Distribution</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      
                      return (
                        <text 
                          x={x} 
                          y={y} 
                          fill="white" 
                          textAnchor="middle" 
                          dominantBaseline="central"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          {(percent * 100).toFixed(0)}%
                        </text>
                      );
                    }}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sentimentData.map((entry) => (
                      <Cell 
                        key={`cell-${entry.name}`} 
                        fill={COLORS[entry.name]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Top Themes */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Themes</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={themeData.slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3182CE" name="Feedback Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Feedback Over Time */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Feedback Over Time</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeSeriesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth()+1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString();
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3182CE" activeDot={{ r: 8 }} name="Feedback Count" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* User Role Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">User Role Distribution (Top)</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      
                      const displayName = name.length > 10 ? name.slice(0, 8) + '...' : name;
                      const percentValue = (percent * 100).toFixed(0);
                      
                      return (
                        <text 
                          x={x} 
                          y={y} 
                          fill="white" 
                          textAnchor="middle" 
                          dominantBaseline="central"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          {percentValue}%
                        </text>
                      );
                    }}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={ROLE_COLORS[index % ROLE_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} (${((value / data.totalFeedback) * 100).toFixed(1)}%)`, name]} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Sentiment by Theme */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sentiment by Theme (Top)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sentimentByThemeData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="theme" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="positive" stackId="a" fill={SENTIMENT_COLORS.positive} name="Positive" />
                <Bar dataKey="neutral" stackId="a" fill={SENTIMENT_COLORS.neutral} name="Neutral" />
                <Bar dataKey="negative" stackId="a" fill={SENTIMENT_COLORS.negative} name="Negative" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Theme and Sentiment Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme Table */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Theme Analysis</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Theme</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {themeData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.value}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {((item.value / data.totalFeedback) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* User Role Table */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">User Role Analysis</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allRoleData.map((item, index) => {
                    const roleSentiment = data.sentimentByRole?.[item.name] || { Positive: 0, Negative: 0, Neutral: 0 };
                    let dominantSentiment = "Neutral";
                    if (roleSentiment.Positive > roleSentiment.Negative && roleSentiment.Positive > roleSentiment.Neutral) {
                      dominantSentiment = "Positive";
                    } else if (roleSentiment.Negative > roleSentiment.Positive && roleSentiment.Negative > roleSentiment.Neutral) {
                      dominantSentiment = "Negative";
                    }
                    
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.value}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${dominantSentiment === 'Positive' ? 'bg-green-100 text-green-800' : 
                              dominantSentiment === 'Negative' ? 'bg-red-100 text-red-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                            {dominantSentiment}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 
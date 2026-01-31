# 💬 FeedbackForce

> AI-powered feedback analysis — turn raw user feedback into actionable insights

## What is it?

FeedbackForce is an AI-powered feedback analysis tool that transforms unstructured user feedback into structured, visual insights. Import feedback from any source, and the app uses OpenAI to perform sentiment analysis, theme extraction, and role-based breakdowns — all visualized through interactive charts and network graphs.

## ✨ Features

- 🤖 **AI-Powered Analysis** — OpenAI automatically categorizes sentiment, themes, and patterns
- 📊 **Rich Dashboard** — Interactive charts showing sentiment distribution, theme breakdown, and trends over time
- 🕸️ **Network Visualization** — Force-directed graph showing relationships between feedback themes
- 📥 **Feedback Importer** — Bulk import feedback from CSV or paste directly
- 🎯 **Sentiment Tracking** — Positive, negative, and neutral sentiment analysis per theme and role
- 👥 **Role-Based Insights** — Break down feedback by user roles (analysts, managers, sales, etc.)
- 📈 **Trend Analysis** — Track feedback patterns over time with line charts
- 🔥 **Heatmap View** — Calendar heatmap of feedback activity

## 🛠️ Tech Stack

- **Framework:** React 18
- **Charts:** Recharts (bar, pie, line charts)
- **Network Graph:** react-force-graph + D3.js
- **AI:** OpenAI API (sentiment & theme analysis)
- **Styling:** Tailwind CSS
- **HTTP:** Axios
- **Deployment:** Netlify

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/THETECHFAI/FeedbackForce.git

# Install dependencies
npm install

# Set your OpenAI API key
export REACT_APP_OPENAI_API_KEY=your_key_here

# Run locally
npm start
```

## 📁 Project Structure

```
src/
├── components/    # UI components (LandingPage, NetworkVisualization, FeedbackImporter)
├── pages/         # Route pages (HomePage, DashboardPage, DemoPage, AboutPage)
├── services/      # OpenAI integration
└── utils/         # Data import utilities
```

## 📄 License

MIT

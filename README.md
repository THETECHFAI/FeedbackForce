# 🔍 FeedbackForce

**AI-powered feedback analysis tool**

> *Turn messy user research into clear insights. Visualise feedback as interactive network graphs powered by OpenAI.*

## What It Does

FeedbackForce transforms raw user feedback into actionable insights through AI-powered analysis and interactive network visualisations. Import feedback from any source, and the AI identifies patterns, themes, and connections — presenting them as a beautiful, explorable network graph. Built for product teams, UX researchers, and anyone drowning in qualitative data.

## ✨ Features

- 🧠 AI-powered feedback analysis via OpenAI
- 🕸️ Interactive network graph visualisations
- 📥 Flexible feedback data importer
- 🎯 Theme and pattern detection
- 📊 Dashboard with aggregated insights
- 🖼️ Beautiful landing page with hero illustrations
- 🎨 Clean, modern UI with Tailwind CSS
- 📱 Responsive design

## 🛠️ Tech Stack

- **React** — Frontend framework
- **JavaScript** — Application logic (234KB)
- **Tailwind CSS** — Utility-first styling
- **OpenAI** — AI-powered feedback analysis
- **Netlify** — Deployment

## 🚀 Getting Started

```bash
git clone https://github.com/THETECHFAI/FeedbackForce.git
cd FeedbackForce
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

You'll need an OpenAI API key configured for the analysis features.

## 📁 Project Structure

```
FeedbackForce/
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx         # Marketing landing page
│   │   ├── NetworkVisualization.jsx # Main graph visualisation
│   │   ├── DemoNetworkVisualization.jsx # Demo mode
│   │   ├── FeedbackImporter.jsx    # Data import interface
│   │   ├── Header.jsx              # Navigation header
│   │   ├── Legend.jsx              # Graph legend
│   │   └── HeroIllustration.jsx    # Landing page art
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── DashboardPage.jsx
│   │   ├── DemoPage.jsx
│   │   └── AboutPage.jsx
│   ├── services/
│   │   └── openaiService.js        # OpenAI integration
│   └── utils/
│       └── importData.js           # Data parsing
├── public/images/                   # Illustrations and assets
├── netlify.toml                     # Deployment config
└── tailwind.config.js
```

## 📄 License

MIT

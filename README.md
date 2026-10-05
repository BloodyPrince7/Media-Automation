# ⚡ Social Pulse Studio

> Next-Generation AI Social Media Automation, Intelligent Adaptation & Multi-Channel Distribution Engine.

[![Release](https://img.shields.io/badge/Release-v1.0.0-6a6afe.svg)](https://github.com/BloodyPrince7/Media-Automation/releases/tag/v1.0.0)
[![Backend](https://img.shields.io/badge/Render-Live-059669.svg)](https://media-automation-backend.onrender.com/api/health)
[![Frontend](https://img.shields.io/badge/Vercel-Deployed-ff6a91.svg)](https://media-automation-henna.vercel.app)
[![Design](https://img.shields.io/badge/Theme-Doooing%20Neo--Brutalist-ffe400.svg)](https://doooing.be)

---

## 🌐 Live Deployments

- 🚀 **Web App (Frontend)**: [https://media-automation-henna.vercel.app](https://media-automation-henna.vercel.app)
- ⚙️ **API Service (Backend)**: [https://media-automation-backend.onrender.com](https://media-automation-backend.onrender.com)
- 📖 **Interactive API Docs (Swagger UI)**: [https://media-automation-backend.onrender.com/docs](https://media-automation-backend.onrender.com/docs)
- 🩺 **Health Check**: [https://media-automation-backend.onrender.com/api/health](https://media-automation-backend.onrender.com/api/health)

---

## ✨ Features & Architecture

### 1. 🎨 Neo-Brutalist Design System
- Built on the bold **Doooing.be** aesthetic: canvas cream `#fef7e6`, bold 2.5px borders `#111116`, signature color blocks (`#ffe400`, `#ff6a91`, `#6a6afe`, `#6CEBB0`), and hard offset drop shadows (`shadow-[8px_8px_0px_#111116]`).
- **Interactive Floating Stage**: Physics-inspired mouse-parallax badges, 3D rotating cubes, follower counters, and radar beacons.
- **Custom Neo Cursors**: Neo-brutalist yellow hard-shadow arrow, pink pointing hand on interactive elements, and highlighter selection.

### 2. 🔐 Full-Stack User Authentication
- Gated entry with dedicated full-page [AuthScreen](file:///c:/Users/Pankaj/Desktop/Media%20Automation/frontend/src/components/AuthScreen.jsx).
- Secure password hashing using **PBKDF2 HMAC SHA-256** with unique 16-byte random salts and 100,000 iterations.
- Session tokens with real-time verification and logout management.

### 3. 📱 Multi-Platform Distribution & Live Simulators
- **X (Twitter)**: Tweepy v2 tweets & v1.1 chunked media uploads with 280-char counter and feed simulation.
- **LinkedIn**: REST Posts API (`POST /rest/posts`) with formatted long-form text and reaction previews.
- **Instagram**: Meta Graph API (Professional/Creator Account) with media aspect ratio enforcement and carousel counters.
- **All Channels Mode**: Author once, preview side-by-side, and adapt per channel.

### 4. 🤖 AI Copilot & Floating Media Advisor Bot
- Integrated with **Google Gemini 2.5 Flash / Flash Lite** via the official `google-genai` SDK.
- **One-Click Content Optimization**: Auto-adapts tone, length, hooks, and hashtags for each destination platform.
- **Floating Media Advisor Bot**: Real-time advice on engagement strategies, caption writing, post timing, and content hooks.

### 5. 📊 Audience Analytics & Performance Dashboard
- Real-time aggregated statistics across all connected channels (Total Followers, Impressions, Engagement Rate, Likes, Reposts).
- Per-platform metric cards, top-performing post breakdowns, and growth indicators.

### 6. ⏰ Background Scheduling & Dispatch Engine
- Powered by **APScheduler** running background cron intervals.
- Non-blocking async queue with scheduled publication at exact timestamps.

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── app/
│   │   ├── config.py              # Environment configuration & credentials
│   │   ├── database.py            # SQLite database engine & session maker
│   │   ├── models.py              # SQLAlchemy models (User, Post, PublishLog, AppSetting)
│   │   ├── schemas.py             # Pydantic schemas
│   │   ├── auth.py                # PBKDF2 hashing & session token management
│   │   ├── scheduler.py           # APScheduler background worker (every 15s)
│   │   ├── ai_service.py          # Google Gemini AI integration
│   │   ├── publishers/            # Multi-channel publishing adapters
│   │   │   ├── base.py
│   │   │   ├── twitter_publisher.py
│   │   │   ├── linkedin_publisher.py
│   │   │   ├── instagram_publisher.py
│   │   │   └── mock_publisher.py
│   │   └── main.py                # FastAPI endpoints & CORS middleware
│   ├── uploads/                   # Uploaded media assets
│   ├── requirements.txt           # Python backend dependencies
│   └── run.py                     # Local development runner
├── frontend/
│   ├── src/
│   │   ├── api/client.js          # Axios API client with dynamic backend resolution
│   │   ├── components/            # UI Components
│   │   │   ├── AuthScreen.jsx     # Gated login & registration screen
│   │   │   ├── Composer.jsx       # Studio post composer & platform switcher
│   │   │   ├── XPreview.jsx       # Twitter live simulator
│   │   │   ├── LinkedInPreview.jsx# LinkedIn live simulator
│   │   │   ├── InstagramPreview.jsx # Instagram live simulator
│   │   │   ├── ScheduledQueue.jsx # Queue manager
│   │   │   ├── PostHistory.jsx    # Delivery logs with live links
│   │   │   ├── AnalyticsDashboard.jsx # Statistics & audience metrics
│   │   │   ├── MediaAdvisorBot.jsx # Floating AI Advisor
│   │   │   └── FloatingObjectsStage.jsx # Parallax background stage
│   │   ├── App.jsx                # Root application
│   │   └── index.css              # Neo-brutalist Tailwind styling & cursors
│   ├── vercel.json                # Vercel proxy rewrite configuration
│   └── vite.config.js             # Vite bundler configuration
├── render.yaml                    # Render Blueprint deployment definition
└── README.md
```

---

## 🚀 Local Development

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
python run.py
```
> Backend runs at `http://127.0.0.1:8080`. API documentation at `http://127.0.0.1:8080/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> Frontend runs at `http://localhost:5173`.

---

## ☁️ Deployment Guide

### Render (Backend Web Service)
1. Link your GitHub repository in [Render Dashboard](https://dashboard.render.com).
2. Create a **Web Service**:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add Environment Variables: `GEMINI_API_KEY`, `PYTHON_VERSION=3.11.9`, and your platform tokens.

### Vercel (Frontend Web App)
1. Import repository in [Vercel Dashboard](https://vercel.com).
2. **Root Directory**: `frontend`
3. **Framework**: `Vite`
4. Deploy — [frontend/vercel.json](file:///c:/Users/Pankaj/Desktop/Media%20Automation/frontend/vercel.json) automatically proxies `/api/*` requests to your Render service!

---

## 📄 License
MIT License © 2026 Pulse Studio Enterprise

# ⚡ Social Pulse Studio

A modern, high-craft social media post automation and multi-platform distribution tool tailored specifically for **X (Twitter)** and **LinkedIn**.

Engineered with a **FastAPI (Python)** backend, **SQLite + APScheduler** queue, and a **Vite + React** dashboard featuring live authentic feed simulators.

---

## 🌟 Highlights & Architecture

- **High-Craft Modern Interface**: Clean, deliberate, dark-mode SaaS UI inspired by Linear & Typefully (not a generic AI template).
- **Authentic Feed Simulators**: Real-time rendering of your post as it will look on **X** and **LinkedIn** (including accurate verified badges, character counts, avatar framing, hashtag highlights, and action bars).
- **Compose Once, Calibrate Per-Platform**: Write a master thought once, or expand into custom per-platform versions (e.g., keep X under 280 characters while adding formatted bullet points for LinkedIn).
- **Reliable Automation & Queue**: Background scheduler running every 15 seconds to execute scheduled posts at exact timestamps.
- **Simulation / Mock Mode**: Test the full publishing workflow, UI, scheduling, and database persistence out of the box without needing developer keys immediately.
- **Live Publishing Gateway**:
  - **X (Twitter)** via Tweepy (v2 API for tweets, v1.1 for media chunks).
  - **LinkedIn** via modern REST Posts API (`POST /rest/posts`).
- **Media Asset Support**: Drag-and-drop support for PNG, JPG, GIF, WebP, and MP4 videos.
- **Audit & Delivery Receipts**: Track delivery status, timestamps, and open direct links to live published posts.

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── app/
│   │   ├── config.py              # Configuration & environment variables
│   │   ├── database.py            # SQLite database engine & session maker
│   │   ├── models.py              # SQLAlchemy models (Post, PublishLog, AppSetting)
│   │   ├── schemas.py             # Pydantic request/response schemas
│   │   ├── scheduler.py           # APScheduler background worker (every 15s)
│   │   ├── ai_service.py          # Gemini AI / heuristic post adapter
│   │   ├── publishers/
│   │   │   ├── base.py            # Base publisher abstract interface
│   │   │   ├── twitter_publisher.py  # X API v2 publisher
│   │   │   ├── linkedin_publisher.py # LinkedIn REST API publisher
│   │   │   └── mock_publisher.py     # High-fidelity simulation mode
│   │   └── main.py                # FastAPI application & REST endpoints
│   ├── uploads/                   # Uploaded media assets storage
│   ├── requirements.txt           # Python dependencies
│   └── run.py                     # ASGI runner script
├── frontend/
│   ├── src/
│   │   ├── api/client.js          # Axios API client wrapper
│   │   ├── components/
│   │   │   ├── Composer.jsx       # Studio composer with character counters
│   │   │   ├── XPreview.jsx       # Authentic X / Twitter feed simulator
│   │   │   ├── LinkedInPreview.jsx# Authentic LinkedIn feed simulator
│   │   │   ├── MediaUploader.jsx  # Drag & drop media dropzone & thumbnails
│   │   │   ├── ScheduledQueue.jsx # Queue and upcoming scheduled posts
│   │   │   ├── PostHistory.jsx    # Delivery audit logs with live links
│   │   │   └── SettingsModal.jsx  # API credentials & mock mode toggle
│   │   ├── App.jsx                # Main workspace & layout
│   │   └── index.css              # Tailwind CSS styles
│   ├── package.json
│   └── vite.config.js             # Vite config with backend proxy
├── .env.example                   # Template environment variables
├── .gitignore                     # Git ignore rules
├── start.bat                      # 1-Click Windows launcher
├── start.ps1                      # PowerShell launcher
└── README.md
```

---

## 🚀 Quick Start

### Option 1: 1-Click Launchers

- **Windows Batch**: Double-click [start.bat](file:///c:/Users/Pankaj/Desktop/Media%20Automation/start.bat).
- **PowerShell**: Run `.\start.ps1` in your terminal.

---

### Option 2: Manual Start

#### 1. Backend (Terminal 1)
```powershell
cd backend
.\.venv\Scripts\python.exe run.py
```
> The backend will start on **`http://127.0.0.1:8000`**. Interactive Swagger docs are available at **`http://127.0.0.1:8000/docs`**.

#### 2. Frontend (Terminal 2)
```powershell
cd frontend
npm.cmd run dev
```
> The frontend will start on **`http://localhost:5173`**.

---

## 🔑 Configuring Live API Credentials

You can test everything right away in **Simulation Mode** (enabled by default). When you are ready to publish to real accounts:

1. Click **Credentials** in the top navigation bar of the app.
2. Toggle **Simulation / Mock Mode** to **Live Production**.
3. Supply your API keys:
   - **X (Twitter)**: API Key, API Secret, Access Token, and Access Token Secret from the [X Developer Portal](https://developer.x.com/).
   - **LinkedIn**: Access Token and Author URN (`urn:li:person:XXXX` or `urn:li:organization:XXXX`) from the [LinkedIn Developer Portal](https://www.linkedin.com/developers/).
   - *(Optional)* **Google Gemini**: API Key from [Google AI Studio](https://aistudio.google.com/) for AI post synthesis.
4. Click **Save Configuration**.

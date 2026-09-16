# MelodyForge — AI Music Composition & Arrangement Studio

MelodyForge is a modern web-based AI music composition and arrangement studio designed for music producers, composers, and sound designers.

---

## 🚀 Phase 1 Architecture & Status

MelodyForge Phase 1 introduces a clean, decoupled full-stack architecture built with Python (FastAPI) and React (TypeScript + Vite).

```text
Frontend (React + Vite + TS + Zustand + Tailwind)
       │  REST API (Axios client)
       ▼
FastAPI Backend (Pydantic v2 + Dependency Injection)
       │  Service Layer (Business Logic)
       ▼
Repository Layer (Data Abstraction)
       │  SQLAlchemy ORM
       ▼
SQLite Database (Configured for easy PostgreSQL migration)
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18+ (Vite, TypeScript strict mode)
- **Styling**: Tailwind CSS (Dark DAW aesthetics)
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Code Quality**: ESLint, Prettier

### Backend
- **Framework**: Python 3.12+ / FastAPI
- **Web Server**: Uvicorn
- **Validation**: Pydantic v2
- **ORM**: SQLAlchemy 2.0+
- **Database**: SQLite (local) / PostgreSQL ready
- **Configuration**: `python-dotenv`

---

## 📁 Directory Structure

```text
melodyforge/
├── frontend/                 # React TypeScript Vite application
│   └── src/
│       ├── components/       # Common UI elements & AppLayout
│       ├── features/         # Feature modules (projects, editor, instruments, timeline, mixer, ai)
│       ├── pages/            # Dashboard, Projects, Studio pages
│       ├── services/         # Centralized Axios API client & endpoints
│       ├── stores/           # Zustand state management
│       ├── types/            # TypeScript interface definitions
│       ├── App.tsx
│       └── main.tsx
│
├── backend/                  # FastAPI REST API backend
│   └── app/
│       ├── api/              # Route handlers & dependency injection
│       ├── core/             # App settings & configuration
│       ├── db/               # SQLAlchemy session & database setup
│       ├── models/           # Database models (Project)
│       ├── schemas/          # Request & Response Pydantic models
│       ├── repositories/     # Data access layer
│       ├── services/         # Business logic layer
│       └── main.py           # Application entrypoint
│
├── music/                    # Static audio assets directory
│   ├── instruments/
│   ├── presets/
│   └── soundfonts/
│
├── projects/                 # Local exported project data / files
├── docs/                     # Architecture & API documentation
├── .gitignore
├── .env.example
└── README.md
```

---

## ⚙️ Getting Started

### 1. Requirements
- Node.js 18+ & npm
- Python 3.10+

### 2. Backend Setup & Launch
```bash
cd backend

# Create virtual environment
python -m venv .venv
# Activate on Windows Powershell:
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```
Backend API will be running at `http://localhost:8000`.
Interactive API docs available at `http://localhost:8000/docs`.

### 3. Frontend Setup & Launch
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend application will be running at `http://localhost:5173`.

---

## 🛰️ REST API Endpoints (Phase 1)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create a new music project |
| `GET` | `/api/projects/{id}` | Get project details by ID |
| `PUT` | `/api/projects/{id}` | Update existing project |
| `DELETE` | `/api/projects/{id}` | Delete project by ID |

---

## 📋 Phase Scope & Roadmap

- [x] **Phase 1 — Foundation, Architecture & Setup**: Core REST API, layered architecture, SQLite database, React SPA layout, dark music studio theme, Project CRUD operations, backend health integration.
- [ ] **Phase 2 — Music Studio UI Foundation**: DAW timeline interface, track headers, transport bar controls, zoom & pan controls.
- [ ] **Phase 3 — Instrument & Audio Engine Setup**: Web Audio API synth synth engine, SoundFont loading, note triggering.
- [ ] **Phase 4 — Piano Roll & Note Editing**: Interactive grid, note placement, velocity editing, quantize logic.
- [ ] **Phase 5 — MIDI Import/Export**: Standard MIDI file parsing and rendering.
- [ ] **Phase 6 — AI Composition Assistance**: Melody & chord progression generation algorithms.

# MelodyForgeX

A modern, full-stack AI-assisted Web DAW and music composition studio for producers, composers, and sound designers.

---

## Overview

**MelodyForgeX** is a feature-rich, web-based Digital Audio Workstation (DAW) and intelligent music composition platform. It combines a professional web DAW interface—complete with a Piano Roll editor, multi-track studio timeline, real-time Web Audio synthesis engine, and interactive mixer—with deterministic algorithmic composition tools and Google Gemini-powered AI music generation and production assistance.

Whether creating multi-track song arrangements, composing chord progressions and melodies, tweaking instrument presets, automating track parameters, exporting high-quality WAV renders or standard MIDI files, or consulting an AI production assistant for mix feedback, MelodyForgeX delivers a complete end-to-end music production workflow.

---

## Key Features

- **DAW Studio Timeline**: Multi-track timeline supporting track creation, mute/solo, volume gain, panning, track color coding, and region arrangement.
- **Piano Roll Editor**: Interactive note grid with pitch, beat quantization, note duration editing, velocity controls, note selection, draw/erase tools, and real-time visual playback position tracking.
- **Real-Time Playback Engine**: Web Audio API and Tone.js synthesis engine providing low-latency multi-track playback, note previewing, and precise transport controls (play, pause, stop, loop, BPM adjustment, time signature).
- **Deterministic Composition Engine**: Algorithmic music generation primitives supporting key/scale selection (Major, Minor, Dorian, Phrygian, Lydian, Mixolydian, Harmonic/Melodic Minor), chord progression templates (e.g., `i-VI-III-VII`, `I-V-vi-IV`), arpeggiator patterns, and melody density controls.
- **AI-Assisted Composition Engine**: Natural-language prompt parsing via FastAPI backend integration with Google Gemini, producing structured multi-track composition specifications with deterministic fallback when API keys are absent.
- **Arrangement & Song Structure Engine**: Dynamic section markers (Intro, Verse, Chorus, Bridge, Outro), section duplication, arrangement reordering, and timeline region management.
- **MIDI Import & Export**: Full bidirectional Standard MIDI File (.mid) interchange, allowing users to import external MIDI files into track regions or export compositions for use in external DAWs.
- **Automation System**: Linear and curve parameter automation lanes for track volume, panning, filter cutoff, and effect parameters with breakpoint node editing.
- **Smart Arrangement Intelligence**: Musical analysis engine providing chord density checks, register collision detection, voice leading validation, and arrangement recommendations.
- **Advanced Sound & Instrument System**: Extensible instrument architecture with built-in synthesized instruments (Piano, Keys, Guitar, Bass, Lead, Pad, Strings, Pluck, Drums), `PresetManager`, central `InstrumentRegistry`, and sample-ready `SampleInstrument` fallback support.
- **Audio Recording & Offline Rendering**: Multi-source audio recording (Microphone, Synth Output) and high-speed offline Web Audio rendering to 16-bit 44.1kHz WAV files with RIFF header generation.
- **Mixing & Mastering System**: 8-channel DAW mixer with gain staging, stereo panning, insert effect chains (EQ, Filter, Delay, Reverb, Compressor, Distortion), bus sends/returns, master compressor/limiter, and real-time peak meters.
- **AI Production Assistant**: Automated project audit tool analyzing track counts, gain staging, frequency collisions, and arrangement balance to deliver actionable mix and production suggestions with one-click preview, apply, and rollback capability.
- **Project Serialization (V1–V5)**: Complete project persistence into `.melodyforge` JSON file format, featuring full backward compatibility for loading V1, V2, V3, and V4 schemas and safe defaults for missing properties.

---

## Architecture

MelodyForgeX follows a decoupled full-stack architecture separating client-side real-time audio playback from server-side AI processing and persistence:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   Frontend (React 18 + Vite + TypeScript)              │
│                                                                        │
│  ┌────────────────────┐   ┌───────────────────┐   ┌─────────────────┐  │
│  │   Zustand Stores   │───│  Tone.js Engine   │───│ Web Audio Nodes │  │
│  │ (Studio/Mixer/Rec) │   │ (Synths/Mixer/FX) │   │ (AudioContext)  │  │
│  └────────────────────┘   └───────────────────┘   └─────────────────┘  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ REST API (Axios)
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    Backend (FastAPI + Python 3.12)                     │
│                                                                        │
│  ┌────────────────────┐   ┌───────────────────┐   ┌─────────────────┐  │
│  │   API Routers      │───│   Service Layer   │───│  SQLAlchemy ORM │  │
│  │(Projects/AI/Health)│   │ (AI/Project Log)  │   │  (SQLite DB)    │  │
│  └────────────────────┘   └─────────┬─────────┘   └─────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │ Google Gemini API / Fallback
                                      ▼
                           ┌─────────────────────┐
                           │   Gemini 1.5 Flash  │
                           └─────────────────────┘
```

### Major Data Flow

1. **User Interaction**: User creates tracks, draws notes in the Piano Roll, configures mixer inserts, or submits AI prompts in the React UI.
2. **State & Audio Graph Update**: Zustand stores update project state, immediately synchronizing note schedules and effect parameter values with the Tone.js transport and Web Audio graph nodes.
3. **AI Request Routing**: Prompt requests sent to `/api/ai/compose` or `/api/ai/production/analyze` are processed by FastAPI services, invoking Google Gemini API when configured or triggering the internal deterministic fallback engine.
4. **Project Storage**: Projects are saved locally as `.melodyforge` (V5 schema) or stored in SQLite database tables via SQLAlchemy ORM.

---

## Technology Stack

### Frontend
- **Framework**: React 18+ (Vite 5, TypeScript strict mode)
- **Audio Engine**: Tone.js 15+ / Web Audio API
- **MIDI Interchange**: `@tonejs/midi`
- **State Management**: Zustand 4.5+
- **Styling**: Tailwind CSS 3.4+ (Dark DAW visual aesthetics)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Code Quality**: ESLint, Prettier

### Backend
- **Framework**: Python 3.12+ / FastAPI
- **Web Server**: Uvicorn
- **Validation & Schemas**: Pydantic v2
- **ORM & Database**: SQLAlchemy 2.0+ with SQLite (`melodyforge.db`)
- **HTTP Client**: HTTPX
- **Testing**: pytest

---

## Project Structure

```text
MelodyForgeX/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/         # FastAPI route handlers (ai.py, projects.py, health.py)
│   │   ├── core/               # Configuration settings and env variables
│   │   ├── db/                 # Database session and base models
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── repositories/       # Database access layer
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── services/           # Business logic & AI Gemini service integration
│   │   └── main.py             # FastAPI application initialization & CORS
│   ├── tests/                  # Pytest backend test suite (9 passing tests)
│   ├── requirements.txt        # Python dependency manifest
│   └── melodyforge.db          # Local SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/         # Common UI components (buttons, modals, headers)
│   │   ├── features/
│   │   │   ├── ai/             # AI composition & AI production assistant components
│   │   │   ├── arrangement/    # Section markers and arrangement engine
│   │   │   ├── audio/          # Sound system, instruments, presets & audio nodes
│   │   │   ├── automation/     # Parameter automation lanes & node editors
│   │   │   ├── composition/    # Algorithmic melody, chord, and arpeggio generators
│   │   │   ├── midi/           # Standard MIDI import & export helpers
│   │   │   ├── mixer/          # DAW mixer channels, insert FX, master bus & meters
│   │   │   ├── pianoroll/      # Interactive grid editor & note rendering
│   │   │   ├── recording/      # Audio capture, recording manager & WAV exporter
│   │   │   └── studio/         # Studio timeline, track header list, and transport
│   │   ├── store/              # Zustand stores (useStudioStore, useMixerStore, etc.)
│   │   ├── types/              # Project TypeScript interfaces & schema definitions
│   │   └── runTests.ts         # Lightweight frontend test runner (285 passing tests)
│   ├── package.json            # Frontend script & package declarations
│   ├── tailwind.config.js      # Custom dark DAW styling configuration
│   └── vite.config.ts          # Vite build options & development server setup
└── README.md                   # Project documentation
```

---

## AI System

The AI System in MelodyForgeX powers both intelligent composition generation and production assistance:

### 1. AI Composition Generation
- **Endpoint**: `POST /api/ai/compose`
- **Functionality**: Accepts natural-language musical prompts (e.g., *"Create an energetic synthwave verse in A minor at 120 BPM"*) along with optional constraints (key, scale, tempo, bars, style, seed).
- **Gemini Integration**: Connects to `gemini-1.5-flash` using `GEMINI_API_KEY`. Prompts are transformed into strict JSON specifications matching Pydantic response schemas without raw MIDI code execution.
- **Deterministic Fallback**: If no API key is supplied or network requests fail, `ai_service.py` executes an internal rule-based mock generator that evaluates prompt keywords to return valid composition payloads.

### 2. AI Production Assistant
- **Endpoint**: `POST /api/ai/production/analyze`
- **Functionality**: Evaluates current project context (track names, instruments, volume levels, panning, section layout) under specified modes (`analyze`, `mix`, `arrange`, `master`).
- **Structured Findings & Suggestions**: Returns categorized observations, issue severity, and actionable adjustments (e.g., `set_track_volume`, `set_track_pan`, `change_bpm`).
- **Interactive Workbench**: Frontend users can preview suggestions before committing changes, track applied suggestion history, or roll back applied adjustments with zero destructive side effects.

---

## Audio / DAW Architecture

### Audio Signal Flow
```text
[Track Note Events / Live Input]
              │
              ▼
[Instrument Instance (Synth / Sampler)]
              │
              ▼
[Track Insert Chain (EQ -> Filter -> Delay -> Compressor)]
              │
              ├─── (Aux Sends) ───► [Shared Reverb / Delay Bus Return]
              ▼                               │
[Track Pan & Channel Fader]                   │
              │                               │
              └───────────────┬───────────────┘
                              ▼
                  [Master Insert FX Chain]
                              │
                              ▼
                  [Master Volume & Limiter]
                              │
                              ▼
                  [AudioDestination (Output)]
```

### Instrument System Details
- **Base Architecture**: Extends `Instrument` interface (`frontend/src/features/audio/types/instrument.ts`) and `BaseInstrument` (`frontend/src/features/audio/instruments/Instrument.ts`).
- **Instrument Registry**: `InstrumentRegistry` acts as a singleton manager for registered instruments, resolving legacy names and providing an automatic fallback to `Acoustic Piano` if missing IDs are queried.
- **Presets & PresetManager**: Built-in presets across Piano, Keys, Guitar, Bass, Lead, Pad, Strings, Pluck, and Drums, alongside user preset persistence in LocalStorage.
- **Sample-Ready Fallback**: `SampleInstrument` provides `Tone.Sampler` structure with status tracking (`idle`, `loading`, `loaded`, `error`) and synthesized fallback when samples are unavailable.

---

## Project File Format

MelodyForgeX uses the `.melodyforge` file format for project saving and loading.

### Version 5 Schema (`V5`)
Projects serialized under V5 include:
- `id`, `name`, `createdAt`, `updatedAt`, `schemaVersion` (set to `5`).
- `projectSettings`: Tempo (BPM), time signature, key, scale, swing, master volume, master pan.
- `tracks`: Track list with instrument IDs, preset configurations, mute/solo flags, volume, pan, color, automation lanes, and note event arrays.
- `sections`: Song structure markers (`name`, `type`, `startBar`, `endBar`).
- `mixer`: Channel strip insert effects, send/return levels, and master bus configuration.

### Backward Compatibility
MelodyForgeX features full backward compatibility for older schema versions:
- **V1**: Legacy track note structure automatically mapped to modern track models.
- **V2**: Legacy project settings validated and updated with missing property defaults.
- **V3**: Automatic integration of section markers.
- **V4**: Mixer channel state preservation and auto-generation for legacy files lacking explicit mixer channels.

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.10 or higher (Python 3.12 recommended)

### 2. Backend Setup & Launch

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Install required dependencies
pip install -r requirements.txt

# (Optional) Set Google Gemini API Key
$env:GEMINI_API_KEY="your-gemini-api-key"

# Run FastAPI development server
uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 3. Frontend Setup & Launch

```bash
cd frontend

# Install Node modules
npm install

# Start Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to launch MelodyForgeX.

---

## Backend API

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health check endpoint returning API service status. |
| `/api/projects` | `GET` | List saved project records from SQLite database. |
| `/api/projects` | `POST` | Create a new project entry. |
| `/api/projects/{project_id}` | `GET` | Retrieve a specific saved project payload by ID. |
| `/api/projects/{project_id}` | `PUT` | Update an existing saved project record. |
| `/api/projects/{project_id}` | `DELETE` | Delete a saved project record. |
| `/api/ai/compose` | `POST` | Generate structured AI composition specification from prompt. |
| `/api/ai/production/analyze` | `POST` | Run AI Production Assistant analysis on project context. |

---

## Testing

MelodyForgeX maintains strict test coverage and code quality verification:

- **Frontend Test Suite**: `285/285` tests passing (`cd frontend && npx tsx src/runTests.ts`)
- **Backend Test Suite**: `9/9` tests passing (`cd backend && .\.venv\Scripts\pytest`)
- **ESLint Code Quality**: `0` errors / `0` warnings (`cd frontend && npm run lint`)
- **Production Build**: `PASS` (`cd frontend && npm run build`)

---

## Release Status

The planned **15-Phase Roadmap** for MelodyForgeX is fully completed and released:
- Official release checkpoint: `966b119` (`feat: finalize melodyforge release`).

---

## Known Limitations

- **Piano Roll Performance**: Active note rendering and timeline interaction perform optimally with up to approximately 5,000 active notes per track.
- **Offline WAV Rendering**: High-speed offline audio rendering speed and maximum duration depend on browser Web Audio context execution limits.

---

## Author

### Creator

**Andhony Saviyar.S**  
Creator & Developer of MelodyForgeX  

GitHub: [https://github.com/andhony07](https://github.com/andhony07)  
Project Repository: [https://github.com/andhony07/MelodyForgeX](https://github.com/andhony07/MelodyForgeX)

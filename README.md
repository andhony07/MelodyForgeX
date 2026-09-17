# MelodyForge — AI Music Composition & Arrangement Studio

MelodyForge is a modern web-based AI music composition and arrangement studio designed for music producers, composers, and sound designers.

---

## 🚀 Architecture & Status

MelodyForge features a decoupled full-stack architecture built with Python (FastAPI) and React (TypeScript + Vite + Tone.js).

```text
Frontend (React + Vite + TS + Zustand + Tone.js + Tailwind)
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

## 🎹 Advanced Sound & Instrument System (Phase 11)

Phase 11 upgrades the audio synthesis engine into an extensible DAW sound and instrument architecture:

### 1. Instrument Architecture
Extends `Instrument` interface in `frontend/src/features/audio/types/instrument.ts` and `BaseInstrument` in `frontend/src/features/audio/instruments/Instrument.ts`:
- **Properties**: `id`, `name`, `category`, `type`, `parameters`.
- **Methods**: `initialize()`, `playNote()`, `previewNote()`, `setVolume()`, `setPan()`, `setMute()`, `setSolo()`, `setParameter()`, `applyPreset()`, `dispose()`.

### 2. Central Instrument Registry
`InstrumentRegistry` (`frontend/src/features/audio/instruments/InstrumentRegistry.ts`):
- Singleton registry managing built-in and custom instruments.
- Resolves instrument IDs and maps legacy names safely to modern registered instruments.
- Safe fallback: Automatically defaults to `Acoustic Piano` if an invalid or missing instrument ID is referenced.

### 3. Presets & Preset Manager
`PresetManager` (`frontend/src/features/audio/presets/PresetManager.ts`):
- Provides built-in presets across Piano, Keys, Guitar, Bass, Lead, Pad, Strings, Pluck, and Drums categories.
- Manages custom user preset creation, local persistence, loading, validation, and deletion.

### 4. Sample-Ready Architecture
`SampleInstrument` (`frontend/src/features/audio/instruments/SampleInstrument.ts`):
- Designed to support `Tone.Sampler` sample mapping configurations without requiring mandatory external sample downloads.
- Includes loading states (`idle`, `loading`, `loaded`, `error`) and graceful fallback to synthesized instruments when samples are unpopulated.

### 5. How to Add a New Instrument
1. Create a new instrument class in `frontend/src/features/audio/instruments/` extending `BaseInstrument`.
2. Define instrument parameters and override `playNote`, `previewNote`, `setParameter`, and `dispose`.
3. Register the instrument factory and metadata in `InstrumentRegistry.registerDefaults()`.

### 6. How to Add a New Preset
1. Open `frontend/src/features/audio/presets/presetDefinitions.ts`.
2. Add a new `InstrumentPreset` object to `BUILT_IN_PRESETS` with a unique `id`, `name`, target `instrumentId`, `category`, and parameter key-values.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18+ (Vite, TypeScript strict mode)
- **Audio Engine**: Tone.js 15+
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

### 3. Frontend Setup & Launch
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run unit test suite
npx tsx src/runTests.ts
```

---

## 📋 Phase Progress

- [x] **Phase 1 — Foundation & Architecture**
- [x] **Phase 2 — Track & Studio Interface**
- [x] **Phase 3 — Interactive Piano Roll & Note Editing**
- [x] **Phase 4 — Audio Engine & Synth Integration**
- [x] **Phase 5 — Algorithmic Music Composition**
- [x] **Phase 6 — AI-Assisted Composition Engine**
- [x] **Phase 7 — Arrangement & Song Structure Engine**
- [x] **Phase 8 — Standard MIDI & Project Interchange**
- [x] **Phase 9 — Advanced Arrangement & Automation Engine**
- [x] **Phase 10 — Smart Arrangement & Musical Intelligence**
- [x] **Phase 11 — Advanced Sound & Instrument System**
- [x] **Phase 12 — Audio Recording & Offline Rendering**
- [x] **Phase 13 — Mixing & Mastering System**

---

## 🎛️ Phase 13 Capabilities: Mixing & Mastering System

- **Mixer Channel Architecture**: Every studio track dynamically maps to a mixer channel with volume dB (-Inf to +6 dB), stereo pan (-100 to +100), mute, solo, real-time peak metering, and send levels.
- **6 Insert Effect Types**: Fully configurable Gain, Filter, 3-band EQ, Compressor, Reverb, and Delay insert effects with parameter sanitization, order adjustment, and single-click bypass.
- **Shared Send/Return Aux Buses**: Efficient shared Reverb and Delay return buses to avoid per-track effect instantiation overhead.
- **Master Bus Processing & Peak Limiting**: Dedicated master channel featuring master volume, master pan, master inserts, peak metering, and soft-peak limiting.
- **Mix Presets**: Built-in mix presets (Clean Mix, Vocal Space, Wide Synth, Punchy Drums, Warm Mix) plus user-created custom preset save, load, and deletion.
- **Schema V4 Serialization**: Backward-compatible V4 project state persistence supporting V1, V2, V3 legacy migration without data loss.
- **Automation & Render Integration**: Real-time Phase 9 volume and pan automation driving runtime mixer parameters, and Phase 12 OfflineRenderer consuming exact mixer configurations.

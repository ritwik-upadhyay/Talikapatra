# Talikapatra 📜
### AI-Powered Historical Research Engine & Digital Scriptorium

**Talikapatra** (Sanskrit: *Chronology Document*) is a premium, high-trust digital workspace designed for historians, academic researchers, and archivists. By blending advanced agentic AI pipelines with the tactile materiality of a physical library, it transforms raw documents into structured historical chronologies, actors, and insights.

---

## 🎨 The "Digital Scriptorium" Design System

Unlike conventional, hyper-modern SaaS platforms, Talikapatra's aesthetic is rooted in the **Digital Scriptorium** philosophy. It evokes the permanence of an ancient scriptorium with contemporary computational precision.

- **Materiality & Vellum Textures**: Warm ivory backgrounds (`#fdf9f4`), weathered bronze lines (`#7c5730`), and organic paper fiber overlays.
- **Typographic Contrast**: 
  - *EB Garamond* (Literary Serif) for historical narrative headers and primary source codex titles.
  - *Inter* (Neutral Sans-Serif) for analytical metadata, labels, and AI-generated dialogue.
- **Historical Metaphors**: 
  - Lined bottom borders mimicking handwritten notebook pages for input fields.
  - Alternating chronology cards centered around year-stamped **bronze wax seals**.
  - Detailed actor plates complete with left-accented selection rails and relevance status seals.

---

## 🏛 Key Features

### 1. Research Collections Dashboard
A central catalog designed as physical index card folios. Track existing investigations, scope reference codes (`REF: SR-1204`), and metadata statistics (Sources, Events, Entities) at a glance.

### 2. Active Workspace & Stage Pipeline
Submit high-level inquiries (e.g. *“Analyze the trade influence of the Srivijaya Empire in the 8th century”*) and monitor the multi-agent AI pipeline across 5 distinct research stages:
1. **Query Classification** (Intent Analysis)
2. **Sources Ranking** (Document Scraping)
3. **Documents Retrieval** (Epigraphic Processing)
4. **Historical Actors Identification** (Lineage Harvesting)
5. **Context Expansion** (Debate Synthesis)

### 3. Sources Explorer
A split-screen parchment reader that handles PDF and text uploads. Browse collected codices, view extraction confidence ratings, and read raw transcripts in a drop-capped scholarly layout.

### 4. Chronological Narrative
An elegant, alternating timeline displaying historical events in order. Unified by a solid gradient bronze timeline path, cards alternate left and right centered around auto-scaling bronze wax seals.

### 5. Actors Index
A structural catalog of extracted entities (Sovereigns, Polities, Trade Guilds, and Manuscripts). Each card dynamically features relevance indices (`status-seal`), custom attributes (reign, lineage, region, condition), and specific context actions (*Examine Folio*, *Map Coordinates*, *Translate Script*).

### 6. Research Assistant
Ask the silent librarian complex historical questions. Dialogues are styled as user handwritten notes (using the *Homemade Apple* font) paired with highly legible assistant letters.

---

## 🛠 Tech Stack

### Backend
- **Core Framework**: FastAPI (Python 3.9+)
- **Database**: SQLite & SQLAlchemy (with custom schema for research trails)
- **Server**: Uvicorn
- **Agent Orchestration**: Multi-Agent system (Compiler, Classifier, Discovery, Extractor, Debate Synthesizer, Expansion)

### Frontend
- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS + Custom CSS class bindings (`.paper-texture`, `.double-rule`, `.wax-seal`, `.folio-border`)
- **Icons**: Material Symbols Outlined

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.9+
- Node.js (v16+) & npm

### 1. Backend Setup
1. Navigate to the backend directory (or stay in root if using `venv`):
   ```bash
   # Create python virtual environment
   python -m venv venv
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```
2. Configure `.env` variables (copy from `.env.example`).
3. Run the database initialization:
   ```bash
   python -m backend.app.init_db
   ```
4. Start the FastAPI Uvicorn server:
   ```bash
   uvicorn backend.app.main:app --reload --port 8000
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

---

## 📦 Production Build
To bundle the frontend assets for production:
```bash
cd frontend
npm run build
```
The compiled output will be generated inside `frontend/dist/`.

---

## 📄 License
© 1894-2024 Talikapatra Archival Systems. All rights reserved. Registered under institutional access licenses.

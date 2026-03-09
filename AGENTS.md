# AGENTS.md - Development Guidelines

## Project Overview

ROS2 bag file visualization toolkit. Monorepo: React + TypeScript frontend, Flask backend, Docker for ROS2 playback.

- **Frontend**: React + TypeScript + Vite (port 3000)
- **Backend**: Flask (port 5001)
- **ROS2**: Docker container (ros2_dev) for bag file playback

## Monorepo Structure

```
.
├── package.json              # Root with workspaces + concurrently
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx           # Top-level component
│   │   ├── main.tsx          # Entry point
│   │   ├── index.css         # Global styles (Pretendard font)
│   │   ├── vite-env.d.ts     # Vite type declarations
│   │   ├── types/index.ts    # All TypeScript interfaces
│   │   ├── constants.ts      # Shared constants (COLORS)
│   │   ├── hooks/
│   │   │   └── useAnalyzer.ts  # API calls + state management
│   │   └── components/
│   │       ├── AnalyzerInput.tsx
│   │       ├── BagResults.tsx          # Orchestrator: data processing + CSV export
│   │       ├── StatsGrid.tsx
│   │       ├── MessageCountChart.tsx
│   │       ├── TopicDistributionChart.tsx
│   │       ├── TimelineChart.tsx
│   │       ├── TopicArrivalOrder.tsx
│   │       ├── TopicTypeGroups.tsx
│   │       └── TopicDetailList.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                  # Flask API (Application Factory + Blueprints)
│   ├── app/
│   │   ├── __init__.py       # Application Factory (create_app)
│   │   ├── routes.py         # Blueprint: API endpoints
│   │   └── services.py       # Business logic (bag parsing, CSV export)
│   ├── run.py                # Entry point
│   └── requirements.txt
├── bag/                      # ROS2 bag files (SQLite .db3 + metadata.yaml)
├── docker-compose.yml
└── requirements.txt
```

## Commands

```bash
# Install all
npm install

# Dev (frontend + backend concurrently)
npm run dev

# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Build (TypeScript check + Vite build)
npm run build

# Lint
npm run lint
```

Frontend: http://localhost:3000
Backend API: http://localhost:5001

### Docker

```bash
docker-compose up -d
docker exec -it ros2_dev bash
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/analyze` | Analyze a single bag path. Body: `{ "path": "..." }` |
| POST | `/api/compare` | Compare multiple bags. Body: `{ "paths": ["...", "..."] }` |
| POST | `/api/export-csv` | Export analysis as CSV download. Body: `{ "path": "..." }` |

## Architecture

### Data Flow
1. User enters bag path in frontend
2. Frontend POSTs to `/api/analyze`
3. Backend reads `metadata.yaml` (YAML) + `.db3` file (SQLite) directly — no ROS2 runtime needed
4. Backend returns JSON with topics, message counts, timelines
5. Frontend renders charts (Recharts) and tables
6. User can download CSV export via `/api/export-csv`

### Bag File Structure
Each bag directory contains:
- `metadata.yaml` — Topic names, types, counts, duration, start time
- `*.db3` — SQLite database with `messages` and `topics` tables containing timestamps and serialized data

## Code Style

### General
- No comments unless explicitly requested
- Concise, direct responses

### Frontend (React + TypeScript)

- **Components**: PascalCase function components (`BagResults`, `StatsGrid`)
- **Hooks**: camelCase with `use` prefix (`useAnalyzer`)
- **CSS classes**: kebab-case (`stats-grid`, `bag-item`)
- **Types**: All interfaces in `src/types/index.ts`
- **State management**: React hooks only (useState, useMemo)
- **Charts**: Recharts library
- **Font**: Pretendard Variable (CDN in index.html)
- **No** `as any`, `@ts-ignore`, `@ts-expect-error`

```tsx
import { useState } from 'react'
import type { BagData } from '../types'

function MyComponent({ data }: { data: BagData }) {
  const [state, setState] = useState<string | null>(null)

  return <div className="container">{/* JSX */}</div>
}

export default MyComponent
```

### Backend (Flask + Python)

- **Variables/functions**: snake_case
- **Classes**: PascalCase
- **Type hints**: Built-in types (`str`, `int`, `dict`)
- **Error handling**: Try/except, return `jsonify({'error': '...'}), 400`
- **Formatting**: Max 100 chars/line, 4 spaces indent
- **Port**: 5001 (run.py), 5000 (docker-compose)

```python
@api_bp.route('/endpoint', methods=['POST'])
def handle_request():
    data = request.json
    if not data:
        return jsonify({'error': 'Invalid request'}), 400
    return jsonify({'result': 'success'})
```

### Git
- Commit message: Brief imperative mood
- Branch: lowercase with hyphens
- Never commit secrets, never force push

## Dependencies

- **Frontend**: react, react-dom, recharts, typescript, vite, @vitejs/plugin-react
- **Backend**: flask, pyyaml, sqlite3 (stdlib)
- **Root**: concurrently (dev runner)
- **ROS2**: Humble (Docker only, not needed for analysis)

## Done Criteria

A task is complete when:
1. `npm run build` passes (tsc + vite build, exit 0)
2. No type errors introduced
3. Existing functionality preserved
4. Code matches established patterns above

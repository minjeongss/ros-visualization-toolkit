# ROS2 Bag Visualization Toolkit

Analyze and visualize ROS2 bag files in the browser. No ROS2 runtime required.

Reads `metadata.yaml` + `.db3` (SQLite) directly — pure Python + a React frontend.

## Quick Start

```bash
npm install
npm run dev
```

Frontend: http://localhost:3000 · Backend API: http://localhost:5001

## What It Does

- **Bag Analysis** — topic counts, timelines, arrival order, type grouping
- **Compare** — side-by-side multi-bag comparison
- **Topic Playback** — timeline scrubber with play/pause and speed control (1x–10x)
- **CSV Export** — download analysis results as CSV

## How It Works

```
metadata.yaml ──→ YAML parse ──→ topics, types, counts, duration
*.db3          ──→ SQLite query ──→ timestamps, per-topic stats
                                          │
                                          ▼
                                    Flask API ──→ React + Recharts
```

No Docker, no ROS2 install. Just Python (PyYAML + sqlite3) and Node.

## Project Structure

```
frontend/          React + TypeScript + Vite
  src/components/  10 visualization components
  src/hooks/       useAnalyzer (API + state)
  src/types/       shared TypeScript interfaces

backend/           Flask (Application Factory + Blueprints)
  app/             __init__.py · routes.py · services.py
  run.py           entry point

bag/               ROS2 bag files (metadata.yaml + .db3)
```

## API

| Method | Path | Body |
|--------|------|------|
| POST | `/api/analyze` | `{ "path": "..." }` |
| POST | `/api/compare` | `{ "paths": ["...", "..."] }` |
| POST | `/api/export-csv` | `{ "path": "..." }` |

## Stack

**Frontend** — React 18, TypeScript, Vite, Recharts, Pretendard

**Backend** — Flask, PyYAML, sqlite3

## Docker (optional)

Only needed for ROS2 bag playback, not for analysis.

```bash
docker-compose up -d
docker exec -it ros2_dev bash
```

## Requirements

- Node.js 18+
- Python 3.10+

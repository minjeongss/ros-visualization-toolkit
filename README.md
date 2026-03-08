# ROS2 Bag Visualization Toolkit

ROS2 bag 파일을 웹 브라우저에서 분석·시각화하는 도구입니다. ROS2 런타임 없이도 bag 파일의 메타데이터와 메시지를 직접 읽어 분석합니다.

## 주요 기능

- **Bag 분석** — 토픽별 메시지 수, 타임라인, 도착 순서, 타입별 그룹 등 종합 분석
- **비교 분석** — 여러 bag 파일을 동시에 비교
- **CSV 내보내기** — 분석 결과를 CSV 파일로 다운로드
- **시각화** — Recharts 기반 차트 (메시지 수 바 차트, 토픽 분포 파이 차트, 타임라인 영역 차트)

## 시작하기

### 사전 요구사항

- Node.js 18+
- Python 3.10+

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (프론트엔드 + 백엔드 동시)
npm run dev
```

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:5001

### Docker (ROS2 bag 재생용)

```bash
docker-compose up -d
docker exec -it ros2_dev bash
ros2 bag play bag/turtlebot_walking_bag
```

> **참고**: bag 파일 분석 자체는 Docker 없이 동작합니다. Docker는 ROS2 bag 재생이 필요할 때만 사용합니다.

## 사용법

1. 웹 브라우저에서 http://localhost:3000 접속
2. bag 파일 경로 입력 (예: `./bag/turtlebot_walking_bag`)
3. **분석** 버튼 클릭
4. 결과 확인 후 필요시 **CSV 다운로드** 버튼으로 내보내기
5. **비교 분석**: 비교 분석 버튼을 눌러 두 개의 bag 경로를 입력하고 비교

## 구조

```
.
├── frontend/          # React + TypeScript + Vite
│   └── src/
│       ├── components/   # 10개 UI 컴포넌트
│       ├── hooks/        # useAnalyzer (API + 상태 관리)
│       ├── types/        # TypeScript 인터페이스
│       └── constants.ts  # 공유 상수
├── backend/           # Flask API (app.py)
│   └── requirements.txt
├── bag/               # ROS2 bag 파일 (metadata.yaml + .db3)
└── docker-compose.yml
```

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 18, TypeScript, Vite, Recharts |
| 백엔드 | Flask, PyYAML, sqlite3 |
| 폰트 | Pretendard Variable (CDN) |
| ROS2 | Humble (Docker, 분석에는 불필요) |

## API

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/analyze` | 단일 bag 분석. Body: `{ "path": "..." }` |
| POST | `/api/compare` | 다중 bag 비교. Body: `{ "paths": ["...", "..."] }` |
| POST | `/api/export-csv` | CSV 다운로드. Body: `{ "path": "..." }` |

## 작동 원리

ROS2 런타임 없이 bag 파일을 직접 분석합니다:

1. `metadata.yaml` — YAML 파싱으로 토픽 이름, 타입, 메시지 수, 녹화 시간 추출
2. `*.db3` — SQLite DB를 직접 쿼리하여 메시지 타임스탬프, 토픽별 통계 계산

이 방식으로 Docker나 ROS2 설치 없이 순수 Python(PyYAML + sqlite3)만으로 분석이 가능합니다.

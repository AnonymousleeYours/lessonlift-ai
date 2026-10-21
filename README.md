# LessonLift AI

LessonLift helps Indian school teachers create and review teaching resources. This repository currently contains an early MVP scaffold, not a finished production service.

## Current MVP

- Responsive React + TypeScript + Vite teacher workspace
- Resource form for lesson plans, notes, quizzes, worksheets, and TLMs
- 5E starter lesson outline, learning-pace and language controls, and inclusive-learning options
- AI generation endpoint scaffold in `server/`
- Local-session library and text export

## Run locally

Requirements: Node.js 20 or later.

### Frontend

```bash
npm install
npm run dev
```

The frontend runs at the Vite URL shown in the terminal (normally `http://localhost:5173`).

### Backend

In a second terminal:

```bash
cd server
npm install
```

Copy `.env.example` to `.env`, then set `OPENROUTER_API_KEY` locally. Never commit real API keys.

```bash
npm run dev
```

The API listens on port 8787 by default. Set `CLIENT_ORIGIN=http://localhost:5173` in the server environment for local development. The frontend calls `/api/generate` on the same origin by default; when deploying frontend and backend separately, set the frontend build environment variable `VITE_API_URL` to the backend's base URL (without a trailing slash), and configure `CLIENT_ORIGIN` on the backend to the deployed frontend origin.

## Deployment notes

- Deploy the frontend as a Vite static site using `npm install` and `npm run build`; publish the `dist` directory.
- Deploy `server/` as a Node service with build command `npm install && npm run build` and start command `npm start`.
- Set `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` (optional; defaults to `openai/gpt-4o-mini`), `PORT` (platform-provided when applicable), and `CLIENT_ORIGIN` in the backend service environment.
- Set `VITE_API_URL` in the frontend build environment to the backend service URL and rebuild the frontend.
- Confirm `GET /api/health` reports `ok: true` and `aiConfigured: true` after deployment.

## Important limitations

- The AI endpoint requires a valid server-side OpenRouter API key and is not verified in a live deployment.
- The library is currently in React state and does not persist across reloads.
- Curriculum alignment must be reviewed by a teacher against the official textbook and syllabus.
- Authentication, database persistence, automated tests, PDF/DOCX export, rate limiting, and production monitoring are not implemented yet.

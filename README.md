# CV Editor

Online CV editor with live preview and PDF export.

## Demo

- GitHub Pages: [https://mr-lexus.github.io/CV-Editor/](https://mr-lexus.github.io/CV-Editor/)
- Repository: [https://github.com/mr-lexus/CV-Editor](https://github.com/mr-lexus/CV-Editor)

## Features

- Edit personal information, work experience, education, and skills
- Live CV preview while editing
- Photo upload with round or square crop mode
- Markdown and visual editing for long text sections
- PDF export through a dedicated backend service
- Clean single-page resume layout optimized for screen and print

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- React Hook Form + Zod
- Express + Puppeteer for local PDF generation
- Vercel serverless function for production PDF generation

## Getting Started

### 1. Install dependencies

```bash
npm install
npm run install:backend
```

### 2. Run the app

Start the frontend:

```bash
npm run dev
```

Start the PDF backend in a separate terminal:

```bash
npm run dev:backend
```

By default:

- Frontend runs on `http://localhost:5173`
- PDF backend runs on `http://localhost:3001`

## Available Scripts

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```bash
npm run dev:backend
npm run build:backend
npm run start:backend
```

## Environment Variables

### Frontend

- `VITE_BASE_PATH` - base path for static deployment, for example `/CV-Editor/`
- `VITE_PDF_BACKEND_URL` - local dev proxy target for Vite, for example `http://localhost:3001`
- `VITE_PDF_API_URL` - absolute production PDF endpoint, for example `https://your-backend.vercel.app/api/pdf/generate`

### Backend

- `PORT`
- `FRONTEND_ORIGIN`
- `ALLOWED_TARGET_ORIGINS`
- `PUPPETEER_EXECUTABLE_PATH`

`FRONTEND_ORIGIN` and `ALLOWED_TARGET_ORIGINS` support comma-separated values.

## Deployment

### GitHub Pages

The repository already includes a workflow at `.github/workflows/deploy-pages.yml`.

Required repository variable:

```text
VITE_PDF_API_URL=https://your-backend.vercel.app/api/pdf/generate
```

### Vercel Backend

Deploy the `backend` directory as a separate Vercel project.

Required environment variables in Vercel:

```text
FRONTEND_ORIGIN=https://mr-lexus.github.io
ALLOWED_TARGET_ORIGINS=https://mr-lexus.github.io
```

If you later use a custom domain, update both values to that domain.

## Project Structure

```text
.
|- src/                    # React application
|- backend/src/            # Local Express + PDF service
|- backend/api/            # Vercel serverless API handlers
|- public/                 # Static assets
|- .github/workflows/      # GitHub Pages deployment workflow
```

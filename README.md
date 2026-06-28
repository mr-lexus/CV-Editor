# CV Editor

Online CV editor with live preview and PDF export.

## Demo

- GitHub Pages: [https://mr-lexus.github.io/CV-Editor/](https://mr-lexus.github.io/CV-Editor/)
- Repository: [git@github.com:mr-lexus/CV-Editor.git](git@github.com:mr-lexus/CV-Editor.git)

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
- Express + Puppeteer for PDF generation

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

## Environment Notes

The frontend proxies `/api` requests to the PDF backend. You can override the backend target with:

```bash
VITE_PDF_BACKEND_URL=http://localhost:3001
```

The backend also supports these environment variables:

- `PORT`
- `FRONTEND_ORIGIN`
- `ALLOWED_TARGET_ORIGINS`
- `PUPPETEER_EXECUTABLE_PATH`

## Project Structure

```text
.
|- src/        # React application
|- backend/    # Express + Puppeteer PDF service
|- public/     # Static assets
```

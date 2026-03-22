# Project: RoastMyProfile AI

**Goal:** A high-speed hackathon MVP that roasts social media profiles via screenshots and generates viral content ideas.

## Tech Stack

- **Frontend:** Vite + React + Tailwind CSS + Shadcn/UI
- **Backend:** Hono (Node/Bun runtime)
- **AI:** Vercel AI SDK (GPT-4o Vision for screenshot analysis)
- **Database:** Supabase (Auth + simple history storage)

## Core Features

1. **Screenshot Upload:** Drag-and-drop zone for a profile screenshot.
2. **Vision Analysis:** GPT-4o scans the image to extract bio, vibes, and visual quality.
3. **Streaming Roast:** A real-time, witty roast of the profile.
4. **Viral Idea Engine:** 3-5 specific content hooks tailored to the extracted niche.
5. **Shareable Scorecard:** A downloadable card (using html-to-image) showing the "Profile Grade."

## Architecture Patterns

- **API Routes:** `/api/analyze` (POST) handles the image and streams response.
- **Client State:** React hooks for handling upload state and stream consumption.
- **Component Style:** Modern, dark-mode focused, high-contrast UI.

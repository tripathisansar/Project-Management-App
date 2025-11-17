# Project Management Dashboard

A lightweight React + Vite dashboard for a video editing team with role-based controls for Admins, PMs, and Editors.

## Features
- **Role simulation:** Switch between Admin, PM, and Editor views to see the appropriate controls.
- **User management:** Admins can add/remove users across roles.
- **Project + task creation:** PMs can create projects, add multiple tasks at once, and assign editors per task.
- **Editor workflow:** Editors can mark tasks as started/completed and log time with optional notes.
- **Local persistence:** Data is stored in `localStorage` under the key `pma-react-data`.

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
   Vite will print a localhost URL you can open in your browser.
3. Build for production:
   ```bash
   npm run build
   ```

## Notes
- The app seeds three users on first load (Admin, PM, and Editor). Switching the "View as" selector lets you preview each role's tools.
- Time entries and statuses are persisted in the browser only; clear `localStorage` to reset.

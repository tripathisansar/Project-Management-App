# Project Management React App

A sleek role-based project management dashboard built with React, Vite, and Material UI. It features simulated authentication with three roles (Admin, Project Manager, and User) and a full hierarchy for projects and tasks.

## Features
- **Authentication & Roles** – Demo credentials for Admin, PM, and User. Admins can create teammates, PMs can plan projects and tasks, and Users can only interact with work assigned to them.
- **Project Layer** – Create, edit, and delete projects complete with owners, summaries, and dates.
- **Task Layer** – Add tasks to projects, assign teammates, and update statuses (Started → In Progress → Completed).
- **User Management** – Admin-only interface for inviting teammates and assigning access levels.
- **Personal Task View** – Each user sees just the tasks assigned to them and can update progress inline.
- **Persistent State** – All data is stored in `localStorage` so experiments stay between sessions.

## Getting started
```bash
cd client
npm install
npm run dev
```
Open the dev server output (typically http://localhost:5173) to explore the app.

### Demo accounts
| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@demo.com` | `admin123` |
| Project Manager | `pm@demo.com` | `pm123` |
| User | `user@demo.com` | `user123` |

Feel free to create additional users and projects from within the UI.

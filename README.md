# ☕ A Shot of Espresso

"A Shot of Espresso" is a cozy, desktop-based productivity application designed to be a beautiful and engaging study companion. Built with Electron and React, it features customizable Pomodoro study timers, animated floating companions, interactive seasonal themes, and localized data persistence via PostgreSQL.

---

## ✨ Features

- **🔐 Secure Authentication:** Full user registration and login workflow secured with password hashing (bcrypt) and JSON Web Tokens (JWT).
- **⏱️ Interactive Pomodoro Timer:** A visual countdown timer accompanied by smooth CSS animations, progress rings, and playful companion interactions.
- **🌸 Seasonal Themes & Effects:** Toggle between atmospheric environments like *Cherry Blossom*, *Autumn*, and *Snow* with custom particle fall effects.
- **🐰 Animated Companions:** Interact with virtual study buddies (Bunny, Axolotl, Owl, Cat, Hamster) that adapt their behavior dynamically.
- **👥 Virtual Study Rooms:** Generate unique invite codes to set up shared, collaborative focus sessions with friends.
- **📊 Productivity Analytics:** Automatic calculation of study logs, session durations, and performance reporting.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js
- **Desktop Wrapper:** Electron (with secure context isolation via preload scripts)
- **Routing:** React Router DOM
- **HTTP Client:** Axios (configured with request interceptors for automated JWT authorization tracking)

### Backend
- **Runtime Environment:** Node.js
- **Server Framework:** Express.js
- **Database Driver:** `pg` (PostgreSQL Client Pool implementation)
- **Security:** BcryptJS & JSON Web Tokens

### Database
- **Engine:** PostgreSQL (Relational schema mapping with foreign key structures, cascaded deletions, and structured lookup indexing)

---

## 📂 Repository Structure

```text
a-shot-of-espresso-desktop/
├── backend/
│   ├── .env                 # Environment variables configuration
│   ├── package.json         # Backend dependencies & runtime scripts
│   └── server.js            # Node/Express API routes & DB connection pool
├── frontend/
│   ├── public/
│   │   ├── electron.js      # Main Electron process handler
│   │   └── preload.js       # Secure Context Bridge exposure API
│   ├── src/
│   │   ├── components/      # Reusable UI parts (Sidebar, Timer, Particles)
│   │   ├── pages/           # High-level views (Dashboard, Login, Rooms)
│   │   ├── styles/          # Modular CSS animation rulesheets
│   │   ├── utils/           # Shared utilities (Axios API layer, Auth sync)
│   │   └── App.js           # Guarded conditional application routes
│   └── package.json         # Frontend configuration & Electron build presets
└── README.md


**🚀 Getting Started**
**Prerequisites**
Before starting, ensure you have the following installed globally:

Node.js (LTS version recommended)

PostgreSQL

**Package Manager:** Either npm or pnpm

**1. Database Initialization**
Connect to your database using your terminal tool or pgAdmin and initialize the system repository:

SQL
CREATE DATABASE espresso_db;
Execute the schema definitions and lookup reference tables provided in the project migration files to populate your tables and configure search optimization indexes.

**2. Environment Configuration**
Create a .env file within your /backend directory and insert your server configuration secrets:

Code snippet
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=espresso_db
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRESQL_PASSWORD
JWT_SECRET=YOUR_SUPER_SECRET_COMPROMISE_KEY
NODE_ENV=development

**3. Dependency Installation**
Navigate into both components of your structure to extract local dependency blueprints.

**Using npm:**__

**Bash**__
** Set up backend dependencies**
cd backend && npm install

** Set up frontend and electron runtime dependencies**
cd ../frontend && npm install

**Using pnpm (Highly Recommended for Speed):**__

**Bash**__
** Set up backend dependencies**
cd backend && pnpm install

 **Set up frontend and electron runtime dependencies**
cd ../frontend && pnpm install

**💻 Running the Application**
To run the application locally in development mode, open any terminal tab **(Powershell,Git Bash, VS Code)**:

open the directory using the folder location 
**Add Command Lines**
npm dev or pnpm dev (for Git Bash)
npm.cmd dev or pnpm.cmd dev (for Powershell and VS Code)


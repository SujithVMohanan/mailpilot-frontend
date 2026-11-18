# ✈️ Mail Pilot — Frontend

React 19 + Vite frontend for the Mail Pilot Gmail Automation Platform.

---

## Clone & Setup

### 1. Clone the repository

```bash
git clone https://github.com/SujithVMohanan/mailpilot-frontend.git
cd mailpilot-frontend/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Mail Pilot
```

### 4. Run the development server

```bash
npm run dev
```

App runs at **http://localhost:5173**

---

## Build for Production

```bash
npm run build
```

Output is in `dist/`.

---

## Folder Structure

```
mailpilot-frontend/
└── frontend/              ← React app lives here
    ├── src/
    │   ├── api/           ← Axios HTTP client
    │   ├── context/       ← Auth context (JWT)
    │   ├── components/    ← Shared UI + layout components
    │   ├── features/      ← Auth, Dashboard, Emails, Rules, Executions
    │   └── pages/         ← Public pages (Home, Privacy Policy)
    ├── public/            ← Static HTML files
    ├── .env               ← Your local env variables (not committed)
    └── package.json
```

---

## Requires Backend

This app needs the **Mail Pilot Django backend** running at `http://localhost:8000`.

```bash
git clone https://github.com/SujithVMohanan/mailpilot-backend.git
cd mailpilot-backend
```

See the backend README for setup instructions.

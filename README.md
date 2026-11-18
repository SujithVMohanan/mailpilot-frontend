# MailPilot — Gmail Rule-Based Email Automation System

An enterprise-grade, full-stack application that connects to Google Gmail via OAuth 2.0, synchronizes inbox emails into a local PostgreSQL database, and executes custom multi-condition automation rules (`ALL` / `ANY` logic) with real-time audit logging and live Gmail message updates.

---

## 🏗️ Architecture Overview

The system is strictly architected into clean separation of concerns:

```
┌───────────────────────────────────────────────────────────┐
│                    React 19 Frontend                      │
│        (Vite + Tailwind CSS + Lucide + Axios + Router)    │
└─────────────────────────────┬─────────────────────────────┘
                              │ HTTP (Bearer JWT Authentication)
                              ▼
┌───────────────────────────────────────────────────────────┐
│              Django REST Framework Backend                │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────┐ │
│  │   apps/users    │  │ apps/google_srv  │  │ apps/rule │ │
│  │ (Auth & Tokens) │  │ (OAuth & Sync)   │  │  (Engine) │ │
│  └─────────────────┘  └──────────────────┘  └───────────┘ │
└──────────────┬───────────────────────────────┬────────────┘
               │                               │
               ▼                               ▼
    ┌──────────────────────┐        ┌──────────────────────┐
    │  PostgreSQL Database │        │   Google Gmail API   │
    │  - Users             │        │  - OAuth 2.0 PKCE    │
    │  - Gmail Accounts    │        │  - users.messages    │
    │  - Emails (MIME)     │        │  - users.modify      │
    │  - Rules & Actions   │        └──────────────────────┘
    │  - Execution Logs    │
    └──────────────────────┘
```

---

## 🚀 Key Features

1. **JWT User Authentication:**
   - Registration, Login, Token Refresh, and Logout with blacklist handling.
   - Axios client with automatic 401 token refresh queue.

2. **Google OAuth 2.0 (PKCE):**
   - Offline refresh token persistence with `EncryptedTextField`.
   - One-click connect, disconnect, and re-authentication.

3. **Email Ingestion & Local Relational Storage:**
   - Syncs Gmail inbox messages into relational database.
   - Extracts sender, recipient, subject, snippet, body HTML/text, received datetime, read status, and label IDs.
   - Deduplication through composite uniqueness on `(account_id, gmail_message_id)`.

4. **In-Memory Predicate Rule Evaluation Engine:**
   - **Crucial Architecture Decision:** Email filtering is executed locally in Python over stored database records—never delegating queries to Gmail query string parser.
   - **Group Predicates:** Match `ALL` (AND) or `ANY` (OR).
   - **Fields Supported:** `FROM`, `TO`, `SUBJECT`, `BODY`, `RECEIVED_DATE`.
   - **String Predicates:** `CONTAINS`, `NOT_CONTAINS`, `EQUALS`, `NOT_EQUALS`.
   - **Temporal Predicates:** `LESS_THAN` and `GREATER_THAN` with `DAYS` or `MONTHS` offsets.

5. **Live Action Execution & Two-Way Sync:**
   - Supported Actions: `MARK_AS_READ`, `MARK_AS_UNREAD`, `MOVE_MESSAGE` (custom destination label).
   - Live synchronization: Applies updates via Gmail REST API `users.messages.modify`, then updates local database records atomically upon verified success.

6. **Audit & Execution History:**
   - Tracks every run: timestamp, evaluated count, matched count, actions succeeded, actions failed.
   - Granular per-email log entries with status and detailed error messages.

---

## ⚙️ Prerequisites

- **Python:** 3.11+ (Python 3.12 recommended)
- **Node.js:** 18+ (v20+ recommended)
- **PostgreSQL:** 14+ running locally or in Docker
- **Google Cloud Platform Project** with Gmail API enabled

---

## 🔧 Environment Configuration

### 1. Backend (`backend/mailpilot-backend/.env`)

```env
SECRET_KEY="your-django-secret-key"
DEBUG=True
ALLOWED_HOSTS="localhost,127.0.0.1"

# Database Settings
DB_NAME="mail-management"
DB_USER="postgres"
DB_PASSWORD="your-postgres-password"
DB_HOST="localhost"
DB_PORT="5432"
DB_CONN_MAX_AGE="60"

# Timezone & CORS
TIME_ZONE=Asia/Kolkata
CORS_ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:5173/oauth/callback"
```

### 2. Frontend (`frontend/mailpilot-frontend/frontend/.env`)

```env
VITE_API_BASE_URL="http://localhost:8000/api"
VITE_APP_NAME="MailPilot"
```

---

## 🔑 Google Cloud Console Setup Guide

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `mailpilot-automation`).
3. Enable the **Gmail API** under **APIs & Services > Library**.
4. Configure the **OAuth consent screen**:
   - User Type: **External**
   - Scopes required:
     - `.../auth/gmail.modify`
     - `.../auth/userinfo.email`
     - `openid`
   - Test Users: Add your personal Gmail address.
5. Create Credentials:
   - Type: **OAuth 2.0 Client IDs (Web application)**
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173/oauth/callback`
6. Copy the **Client ID** and **Client Secret** into your backend `.env`.

---

## 📦 Installation & Setup

### Backend Setup

```powershell
cd D:\tortillon\backend\mailpilot-backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Seed sample automation rules (optional)
python manage.py seed_sample_rules

# Start Django development server
python manage.py runserver 127.0.0.1:8000
```

- Backend API: `http://127.0.0.1:8000/api/`
- Interactive Swagger Documentation: `http://127.0.0.1:8000/api/docs/`
- ReDoc Documentation: `http://127.0.0.1:8000/api/docs/redoc/`

### Frontend Setup

```powershell
cd D:\tortillon\frontend\mailpilot-frontend\frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

- Frontend App: `http://localhost:5173`

---

## 📋 Comprehensive API Specification

### Authentication (`/api/users/`)
- `POST /api/users/register/` — Register with `email`, `password`, `confirm_password`
- `POST /api/users/login/` — Authenticate and receive `{ access, refresh, user }`
- `POST /api/users/refresh/` — Obtain new access token via `{ refresh }`
- `POST /api/users/logout/` — Blacklist refresh token
- `GET /api/users/me/` — Retrieve currently authenticated user profile

### Gmail Integration (`/api/mail/`)
- `GET /api/mail/oauth/initiate/` — Generate Google consent URL
- `POST /api/mail/oauth/callback/` — Exchange code and state for credentials
- `POST /api/mail/disconnect/` — Revoke and remove Gmail account link
- `GET /api/mail/labels/` — Retrieve user's Gmail labels
- `POST /api/mail/sync/` — Fetch and store inbox emails (`max_results`)
- `GET /api/mail/` — Search & list emails (`search`, `is_read`, `ordering`, `page`, `limit`)
- `GET /api/mail/<id>/` — Retrieve full email details including body HTML
- `GET /api/mail/stats/` — Dashboard metrics (counts, active rules, recent runs)

### Automation Rules (`/api/rules/`)
- `GET /api/rules/` — List configured rules
- `POST /api/rules/` — Create new rule with conditions and actions
- `GET /api/rules/<id>/` — Get single rule details
- `PUT /api/rules/<id>/` — Update rule, conditions, and actions
- `DELETE /api/rules/<id>/` — Delete rule
- `POST /api/rules/<id>/toggle/` — Toggle active status
- `POST /api/rules/<id>/execute/` — Run rule against stored emails
- `POST /api/rules/execute-all/` — Execute all active rules
- `GET /api/rules/executions/` — Audit history with per-email logs (`rule`, `page`, `limit`)

---

## 🧪 Testing

```powershell
# Run backend pytest suite
cd D:\tortillon\backend\mailpilot-backend
pytest apps/rule/tests/ -v

# Run frontend build verification
cd D:\tortillon\frontend\mailpilot-frontend\frontend
npm run build
```

---

## 📄 License
This project was developed for the Fullstack Assessment Evaluation. All rights reserved.

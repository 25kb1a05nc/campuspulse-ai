# 🎓 CampusPulse AI

### Student Success Intelligence Dashboard

**Support, not labels.**

CampusPulse AI is a faculty- and administrator-focused dashboard that helps educational institutions review student academic indicators, identify students who may need additional support, and plan timely interventions.

🌐 **Live Demo:** https://campuspulse-ai-3889a.web.app  
💻 **GitHub Repository:** https://github.com/25kb1a05nc/campuspulse-ai

---

## 🚀 The Problem

Academic difficulties can go unnoticed when student information is scattered across records and spreadsheets. Faculty need a convenient way to review academic indicators and identify where additional attention may be useful.

## 💡 Our Solution

CampusPulse AI brings student records, academic indicators, visual analytics, and intervention workflows into one dashboard for authorized faculty and administrators.

The goal is to support early attention and informed human decisions—not to label students or replace faculty judgment.

## ✨ Key Features

- 📊 **Dashboard Overview** — View student statistics and academic insights.
- 👨‍🎓 **Student Directory** — Search, filter, sort, and inspect student records.
- 🚦 **Risk Indicators** — Review prototype indicators based on available academic data.
- 📈 **Visual Analytics** — Explore department-level and risk-related charts.
- 📝 **Intervention Workflow** — Help staff identify students who may benefit from follow-up.
- ➕ **Student Record Management** — Add student records through the application.
- 📥 **CSV Export** — Export available student data into excel and other formats.
- 🔐 **Staff Authentication** — Firebase Authentication for sign-in.
- 🛡️ **Role-Based Authorization** — Access intended for authorized faculty and administrators.
- 🧪 **Synthetic Demo Data** — Demonstrate the dashboard without exposing real student records.

## 🔑 Validator Demo Access

**Live application:** https://campuspulse-ai-3889a.web.app

For hackathon validators, use the dedicated demonstration account provided by the project team.

| Field | Demo details |
|---|---|
| Login URL | https://campuspulse-ai-3889a.web.app |
| Demo email | `YOUR_DEMO_EMAIL` |
| Demo password | `REQUEST_FROM_PROJECT_TEAM` |
| Access | Authorized demo staff account |

**Important:** The credentials above are placeholders, not working login credentials. Replace them with your chosen validator access instructions after configuring a dedicated demo account.

The demo account should have access only to synthetic demonstration data and the minimum permissions required for evaluation. Do not publish personal staff credentials or production administrator passwords.

## 🛠️ Technology Stack

- React
- Vite
- JavaScript
- CSS
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- Lucide React

## 🌐 Live Deployment

CampusPulse AI is deployed using Firebase Hosting.

**Visit:** https://campuspulse-ai-3889a.web.app

## 💻 Run Locally

### Prerequisites

- Node.js
- npm
- A Firebase project with Authentication and Cloud Firestore configured

### 1. Clone the repository

```bash
git clone https://github.com/25kb1a05nc/campuspulse-ai.git
cd campuspulse-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Replace these example values with the configuration for your Firebase web app.

Never commit `.env`, private service-account keys, passwords, or other secrets to GitHub.

### 4. Start the development server

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
```

### 6. Deploy to Firebase Hosting

Install the Firebase CLI if necessary:

```bash
npm install -g firebase-tools
firebase login
firebase use campuspulse-ai-3889a
npm run build
firebase deploy --only hosting
```

## 🗺️ Planned Features — V2

- 📅 Subject-wise attendance tracking
- 📝 Subject-wise mid-examination marks
- 📊 Bulk academic data import

These features are planned and should not be considered available in the current release.

## 🔒 Privacy and Security

- Application access is intended for authorized faculty and administrators.
- Authentication and authorization are separate requirements.
- Firestore Security Rules must enforce the intended access restrictions.
- Demo accounts should use synthetic data and minimal permissions.
- No real student records or confidential credentials should be included in the public repository.
- Prototype risk indicators are not validated predictions of student outcomes.

## ⚠️ Disclaimer

CampusPulse AI is a hackathon prototype intended to support staff review and student support. Its indicators should not be treated as definitive judgments about students. Academic decisions should involve verified records, human review, and appropriate institutional processes.

## 🎯 Project Vision

To help institutions move from scattered academic records toward timely, supportive, data-informed student success interventions.

**CampusPulse AI — Support, not labels.**

Built as a hackathon project.

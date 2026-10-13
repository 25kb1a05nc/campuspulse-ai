# CampusPulse AI
React + Vite + Firebase Firestore hackathon prototype.

## Run
1. Install Node.js LTS.
2. Open this folder in VS Code.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and add your Firebase web-app config.
5. Run `npm run dev`.

Without Firebase config the app uses synthetic local demo data. With Firebase configured, it reads and writes the `students` Firestore collection.

## Firebase
Create a Firebase project, register a web app, copy its config into `.env`, then create a Firestore database. The starter does not include authentication or role-based access. Use synthetic data only until proper auth and security rules are implemented.

## Demo score
The score formula is a prototype: academic 35%, attendance 25%, LMS 15%, engagement 10%, placement readiness 15%. It is not an official KPMG formula or validated prediction. Risk rules should prompt human review, never determine high-stakes decisions.

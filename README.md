# ExamPath — Separate Admin, Student and Server Apps

## Folder layout
- `admin/` — separate administrator frontend (Vite, default port 5174)
- `user/` — separate student frontend (Vite, default port 5173)
- `server/` — Express API + MongoDB models/routes (default port 4000)
- `docs/` — project notes

## Requirements
Node.js 20+, npm, and MongoDB Atlas/local MongoDB.

## 1. Configure and run the API
```bash
cd server
npm install
```
Copy `.env.example` to `.env` and set `MONGO_URI`, a random `JWT_SECRET` of at least 32 characters, and Razorpay credentials for real payments. Keep `.env` private.

```bash
npm run dev
```
Health endpoint: `http://localhost:4000/api/health`

## 2. Run the student website
In a second terminal:
```bash
cd user
npm install
```
Copy `.env.example` to `.env`, then run:
```bash
npm run dev
```
Open `http://localhost:5173`.

## 3. Run the admin website
In a third terminal:
```bash
cd admin
npm install
```
Copy `.env.example` to `.env`, then run:
```bash
npm run dev
```
Open `http://localhost:5174`.

## Admin access
Register a normal account through the student site, then promote that specific account to `role: "admin"` in MongoDB using a trusted database admin account. Sign in to the admin site with it. Do not expose an admin-role selector in public registration.

The server accepts frontend origins listed in `CLIENT_ORIGINS` as comma-separated URLs. In production, set this to the exact HTTPS admin and student domains. Configure secure cookies/HTTPS and review auth, payment webhooks, backups, logging and rate limits before public launch.

## Feature areas
- Admin frontend: create exams, add parts, add questions and correct answers.
- Student frontend: account, exam browsing, test-taking, pricing and leaderboard routes.
- Server: auth, exams, admin operations, payment and test routes.

Run `npm run build` inside both `user/` and `admin/` before deployment. End-to-end payment/database behavior still needs testing with your own environment credentials.


## Admin login says "Failed to fetch"
This message means the browser could not reach the API; it is different from an invalid password.

1. Start the backend in its own terminal: `cd server`, `npm install`, copy `.env.example` to `.env`, fill in a valid `MONGO_URI` and a `JWT_SECRET` of at least 32 characters, then run `npm run dev`.
2. Open `http://localhost:4000/api/health`. It should return `{"status":"ok"}`. If it does not load, check the backend terminal first; a bad MongoDB URI or unavailable Atlas network access prevents the server from starting.
3. Start the admin app separately with `cd admin`, `npm install`, `npm run dev`, and open `http://localhost:5174`.
4. If you change `admin/.env` or `user/.env`, restart Vite. The variable should be `VITE_API_URL=http://localhost:4000`.
5. Use `localhost` consistently (avoid mixing it with `127.0.0.1` in browser URLs), or make sure the browser origin is included in `CLIENT_ORIGINS` in `server/.env`.
6. After the API is reachable, if login returns a 401, check the email/password. If it returns 403, promote the intended account's `role` to `admin` in MongoDB and sign in again.


## Student test submission shows a blank page
The student test result page imports `ArrowRight` and sends every test question when submitting (unanswered questions use `selectedOption: null`). The backend scores only selected answers, but counts all test questions toward total marks and returns all questions for review. Restart `server` and `user` after updating.


## Separate test-series purchases (updated)
- Student dashboard groups series into Railway, SSC, Banking, Teaching, Police and State Exams categories.
- Each series has its own price and 180-day access period by default. Only the purchased series unlocks.
- The profile menu contains My Profile, My Purchases, Settings and Logout.
- Admin creates each series with a category and price in rupees.
- To add the starter catalog (only creates missing slugs and adds default parts only when a series has no parts), run:
  `cd server` then `npm run seed:catalog`
- The seed catalog creates example series and subject/part names; it does not create actual questions. Admin must add/import questions before students can take those tests.
- Razorpay credentials must be configured in `server/.env`; use test keys for development. A successful server-verified payment unlocks only the selected exam series.
- Older global-subscription payment records without an exam reference do not automatically unlock every series.

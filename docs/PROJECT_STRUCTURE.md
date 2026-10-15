# ExamPath project structure

```text
ExamPath_Organized/
├── admin/                  # Separate administrator React/Vite app (port 5174)
│   └── src/
│       ├── context/         # Authentication state
│       ├── layouts/         # Admin-only navigation
│       ├── pages/            # Admin question/exam management
│       └── services/        # API client
├── user/                   # Separate student React/Vite app (port 5173)
│   └── src/
│       ├── components/
│       ├── context/
│       ├── layouts/
│       ├── pages/            # Home, auth, dashboard, test, leaderboard
│       └── services/
├── server/                 # Separate Express API (port 4000)
│   └── src/
│       ├── config/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── utils/
│       ├── validators/
│       ├── app.js
│       └── server.js
└── docs/
```

The admin and student apps use the same API but have different entry points and navigation. API authorization remains enforced on the server; hiding an admin page in the frontend is not a substitute for server-side authorization.

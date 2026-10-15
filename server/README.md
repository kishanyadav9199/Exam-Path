# ExamPath Backend

Node.js + Express + MongoDB/Mongoose API.

## Folder structure

```text
server/
├── .env.example
├── package.json
└── src/
    ├── app.js                    # Express setup, security middleware, route mounting
    ├── server.js                 # MongoDB connection and server startup
    ├── config/
    │   └── env.js                # Environment variables and application config
    ├── middlewares/
    │   └── auth.middleware.js    # JWT authentication, admin and subscription guards
    ├── models/
    │   ├── index.js              # Model exports
    │   ├── user.model.js
    │   ├── exam.model.js
    │   ├── part.model.js
    │   ├── question.model.js
    │   ├── attempt.model.js
    │   └── payment.model.js
    ├── routes/
    │   ├── auth.routes.js         # Register, login, logout, current user
    │   ├── exam.routes.js         # Exam/part listing and leaderboard
    │   ├── admin.routes.js        # Admin exam, part and question management
    │   ├── payment.routes.js      # Razorpay order and payment verification
    │   └── test.routes.js         # Start test, submit answers, attempt history
    ├── utils/
    │   ├── asyncRoute.js          # Async Express error wrapper
    │   └── auth.js                # Auth cookie, JWT sign-in and public user response
    └── validators/
        └── schemas.js             # Request validation schemas
```

## Setup

1. Copy `.env.example` to `.env` and fill in your real MongoDB Atlas URI, a strong JWT secret (at least 32 characters), and Razorpay test/live credentials.
2. From this directory run `npm install`.
3. Run `npm run dev` for development or `npm start` to start the API.
4. Health check: `GET http://localhost:4000/api/health`.

Never commit `.env` or expose Razorpay secrets in the frontend. Set an account's `role` to `admin` manually in MongoDB; do not add public admin registration.

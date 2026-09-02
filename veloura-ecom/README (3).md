# Veloura — Wear Your Aura

A full-stack fashion e-commerce platform featuring curated men's and women's collections, editorial styling, and a complete admin control hub.

## Tech Stack

- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express, Mongoose (MongoDB)
- **Database:** MongoDB Atlas
- **Payments:** Razorpay
- **AI Chatbot:** Google Gemini (`@google/genai`)
- **Email:** Nodemailer (SMTP)
- **Deployment:** Docker, Docker Compose, AWS EC2, nginx (reverse proxy)

## Features

- Product catalog with categories, search, and filtering
- User authentication (login/register) with JWT
- Shopping cart and wishlist
- Checkout with captcha verification and Razorpay payment integration
- Admin dashboard: product inventory (manual + bulk CSV import), order management, sales analytics, customer list
- AI-powered shopping assistant chatbot
- Email notifications (order confirmations, contact form)

## Project Structure

```
veloura-ecom/
├── src/                    # React frontend
│   ├── components/         # UI components (admin, security, etc.)
│   ├── pages/               # Route-level pages
│   └── services/             # API client / HTTP layer
├── server/                  # Express backend
│   ├── controllers/          # Route logic
│   ├── models/                 # Mongoose schemas
│   ├── routes/                  # API route definitions
│   ├── middleware/                # Auth, validation
│   ├── seed/                        # Sample product seeding script
│   └── server.js                     # Backend entry point
├── Dockerfile                # Frontend build (Vite → nginx)
├── server/Dockerfile           # Backend build (Node/Express)
├── docker-compose.yml            # Multi-container orchestration
├── nginx.conf                      # Reverse proxy config (/api → backend)
└── .env.example                      # Environment variable template
```

## Environment Variables

Copy `.env.example` to `.env` and fill in real values. **Never commit `.env`.**

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` / `ADMIN_JWT_SECRET` | Random long strings for signing auth tokens |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Default admin login credentials |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | From the Razorpay Dashboard |
| `GEMINI_API_KEY` | Google AI Studio API key, for the chatbot |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | Email sending credentials |

## Running Locally with Docker

```bash
docker compose build
docker compose up -d
```

Visit `http://localhost:3000`. The frontend is served by nginx and proxies `/api/*` requests to the backend container.

To seed sample products into MongoDB:
```bash
docker compose exec server npm run seed
```

## Running Locally without Docker

**Frontend:**
```bash
npm install
npm run dev
```

**Backend:**
```bash
cd server
npm install
npm start
```

## Deployment

This project is deployed via Docker Compose on an AWS EC2 instance (Amazon Linux 2023). See `docker-compose.yml` for the two-service setup (`client` on port 3000, `server` on port 5000, both networked together). MongoDB is hosted externally on MongoDB Atlas.

## Security Notes

- All secrets are loaded from environment variables — no credentials should ever be hardcoded in source files.
- `.env` is git-ignored and must never be committed.
- Rotate any credentials that may have been exposed during development.

## License

Private project — all rights reserved.

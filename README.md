# Best Cars Dealership — Full Stack Capstone Project

A full-stack web application built for **Best Cars Dealership**, a national car retailer in the U.S. The app lets users browse dealership branches across states, view per-dealer details, read customer reviews, and post their own reviews after signing in. Reviews are scored by an AI sentiment-analysis microservice.

## Architecture

| Layer | Tech |
|-------|------|
| Frontend (UI) | Django templates + React (Home, Login, Register, Dealers, Dealer detail, Post Review, About, Contact) |
| Backend — App | Django (`server/djangoapp`) — handles auth, dealer/review proxying, car make/model models |
| Backend — Data | Node.js + Express + Mongoose (`server/database`) backed by MongoDB — dealers and reviews data layer |
| Backend — AI | Python Flask sentiment-analysis microservice — returns positive / negative / neutral for review text |
| Auth | Django session auth (login / logout / register) |
| Data | MongoDB (dealers, reviews), SQLite (Django: users, car makes & models) |
| Container | Docker + docker-compose for MongoDB service |
| Deployment | Kubernetes + IBM Cloud Code Engine |
| CI/CD | GitHub Actions (lint + tests) |

## Repository Layout

```
server/
├── djangoapp/        # Django app — views, models, REST API proxies, populate.py
├── djangoproj/       # Django project settings + URL routing
├── frontend/         # Static HTML pages + React build output
│   └── static/       # About.html, Contact.html, Home.html, style.css, images
├── database/         # Node.js + Express + Mongoose — dealers & reviews API
│   ├── app.js
│   ├── dealership.js
│   ├── review.js
│   ├── inventory.js
│   ├── docker-compose.yml
│   └── Dockerfile
├── manage.py
├── package.json
└── requirements.txt
```

## Local Development

1. Install Python deps: `pip install -r server/requirements.txt`
2. Install Node deps: `cd server/database && npm install`
3. Start MongoDB (Docker): `cd server/database && docker compose up -d mongo_db`
4. Start the Express data layer: `cd server/database && node app.js`
5. Start the sentiment Flask microservice (if running locally).
6. Run Django migrations + start server:
   ```bash
   cd server
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser   # for /admin
   python manage.py runserver
   ```

## Submission Artifacts

The `submissions/` directory captures the cURL outputs, terminal logs, and screenshots required for the Mark AI grader (login/logout/register/get-all-dealers/get-dealer-by-id/get-dealers-by-state/get-all-car-makes/analyze-review, plus screenshots of the running app).

## License

Apache-2.0 — see `LICENSE`.

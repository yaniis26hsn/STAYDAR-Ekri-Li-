# Lekra Backend

Node.js and Express backend for an apartment rental/listing application. It uses MongoDB with Mongoose, JWT authentication, and Google OAuth via Passport.

## Features

- User registration and login
- Google OAuth authentication
- Apartment CRUD endpoints
- Filters by town, type, price, surface, and rating
- Sorting and search endpoints

## Tech Stack

- Node.js
- Express
- MongoDB / Mongoose
- JWT
- Passport Google OAuth 2.0

## Setup

```bash
npm install
```

Create a `.env` file with:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=your_google_callback_url
FRONTEND_URL=your_frontend_url
```

Run the server:

```bash
npm run dev
```

Or in production:

```bash
npm start
```

## Base URL

`/api/v1`

## Main Endpoints

### Auth

- `POST /register`
- `POST /login`
- `GET /google`
- `GET /google/callback`

### Users

- `GET /user`
- `GET /user/:id`
- `PUT /user/:id`
- `DELETE /user/:id`
- `GET /getUsersOfATown/:town`

### Appartements

- `GET /appartements`
- `POST /appartement`
- `PUT /appartement/:id`
- `DELETE /appartement/:id`
- `GET /search`
- `GET /getByTown/:town`
- `GET /getByType/:type`
- `GET /betweenPrice/:price1/:price2`
- `GET /betweenSurface/:surface1/:surface2`
- `GET /betweenRating/:rating1/:rating2`
- `GET /sortByPrice`
- `GET /sortBySurface`
- `GET /sortByRating`
- `PUT /rateAppartement/:rating`

## Notes

- CORS is restricted through `FRONTEND_URL`.
- The server validates required environment variables before startup.
- The current `.env` in this repo appears to contain real secrets and should be rotated if they are still active.

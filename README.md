Hello this is my startup , it's a small website , the project is still under devolpment , but you can still  access it through render where it was deployed : staydar.onrender.com

## Backend Overview

This project includes a Node.js and Express backend for an apartment rental/listing application. It uses MongoDB with Mongoose, JWT authentication, and Google OAuth with Passport.

## Features

- User registration and login
- Google OAuth authentication
- Apartment CRUD endpoints
- Filtering by town, type, price, surface, and rating
- Sorting and search endpoints

## Tech Stack

- Node.js
- Express
- MongoDB / Mongoose
- JWT
- Passport Google OAuth 2.0

## Backend Setup

```bash
cd BACKEND
npm install
```

Create a `.env` file in `BACKEND/` with:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=your_google_callback_url
FRONTEND_URL=your_frontend_url
```

Run the backend:

```bash
npm run dev
```

For production:

```bash
npm start
```

## API Base URL

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

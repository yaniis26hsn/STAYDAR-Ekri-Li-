# Staydar Backend

This repository contains the backend for Staydar, an apartment rental and listing platform built with Node.js, Express, MongoDB, and JWT authentication.

## Purpose

This backend focuses on the core platform logic:

- authentication and session restoration with JWT
- user profile management
- apartment ownership and moderation
- listing discovery through search, filters, sorting, and ratings

## Main concepts

- **JWT session**: the frontend stores the token and sends it on protected requests
- **Authenticated user**: the backend reads the user id from the token payload
- **Ownership**: apartments belong to one user through `ownerId`
- **Ratings**: users can rate apartments, and the backend keeps an aggregate score

## Data models

- **User**: profile data, credentials, contact info, and a rating summary
- **Appartement**: apartment details plus `ownerId`
- **Rating**: one user rating per apartment

## Auth flow

- `POST /login` returns a JWT token
- `POST /register` creates a user account
- `GET /google` and `GET /google/callback` support Google OAuth
- `GET /me` returns the current authenticated user
- Protected routes expect `Authorization: Bearer <token>`

## User flow

- `PUT /user/me` updates the logged-in user profile
- `GET /getUserApparts` returns only the apartments owned by the logged-in user
- Public user lookup routes still exist for later role-based authorization work

## Apartment flow

- `POST /appartement` creates an apartment and stores the authenticated user as `ownerId`
- `PUT /appartement/:id` updates only apartments owned by the authenticated user
- `DELETE /appartement/:id` deletes only apartments owned by the authenticated user
- `PUT /updatePrice/:newPrice` updates the owner’s apartment price
- `PUT /rateAppartement/:rating` stores or updates a user rating for an apartment

## Query endpoints

The backend also supports:

- search by town, type, price, surface, and rating
- sort by price, surface, and rating
- rating range filters
- nearby apartment lookup by coordinates

## Tech stack

- Node.js
- Express
- MongoDB / Mongoose
- JWT
- Passport Google OAuth 2.0

## Setup

```bash
cd BACKEND
npm install
```

Create `BACKEND/.env` with:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=your_google_callback_url
FRONTEND_URL=your_frontend_url
```

Run locally:

```bash
npm run dev
```

Production:

```bash
npm start
```

## API base

`/api/v1`

## Notes

- `ownerId` is assigned server-side from the JWT, not from the frontend.
- Apartment edit/delete routes check ownership.
- The frontend uses the token to restore the session and load the profile dashboard.
- The app serves the frontend bundle from Express in production, so the backend and frontend stay in one deployment on Render.

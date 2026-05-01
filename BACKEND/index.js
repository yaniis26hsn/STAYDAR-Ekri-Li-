import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import appartementRouter from './routes/appartement.js'
import userRouter from './routes/user.js'
import authRouter from './routes/authn.js'
import passport from 'passport';

import './config/passport.js'; // importing it so it executes


dotenv.config()

const app = express()
const port = process.env.PORT || 4000 ;
// middlewares

app.use(cors({
  origin: process.env.FRONTEND_URL
}));
app.use(passport.initialize());
app.use(express.json());

// routes
app.use('/api/v1', appartementRouter) ;
app.use('/api/v1', userRouter) ;
app.use('/api/v1',authRouter) ;

const startServer = async () => {
  try {
    const requiredEnvVars = [
      'MONGO_URI',
      'JWT_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_CALLBACK_URL',
      'FRONTEND_URL'
    ]

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`${envVar} is missing`)
      }
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected successfully')
    app.listen(port, () => {
      console.log(`we are listening at the port : ${port}`)
    })
  } catch (error) {
    console.error('database connection failed:', error.message)
    process.exit(1)
  }
}

startServer()

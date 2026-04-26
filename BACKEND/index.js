import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import appartementRouter from './routes/appartement.js'
import userRouter from './routes/user.js'
import authRouter from './routes/authen.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000 ;
// middlewares
app.use(cors());
app.use(express.json());
app.use('/api/v1', appartementRouter) ;
app.use('/api/v1', userRouter) ;
app.use('/api/v1',authRouter) ;

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing')
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

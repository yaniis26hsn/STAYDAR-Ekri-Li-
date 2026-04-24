import express from 'express'
import cors from 'cors'
import appartementRouter from './routes/appartement.js'
import userRouter from './routes/user.js'
const app = express()
const port = 4000 ;
// middlewares
app.use(cors());
app.use(express.json());
app.use('/api/v1', appartementRouter) ;
app.use('/api/v1', userRouter) ;



app.listen(port , console.log( `we are listening at the port : ${port}`) ) ;  

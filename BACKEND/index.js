import express from 'express'
import appartementRouter from './routes/appartement.js'
const app = express()
const port = 4000 ;
// middlewares
app.use(express.json());
app.use(appartementRouter) ;



app.listen(port , console.log( `we are listening at the port : ${port}`) ) ;  
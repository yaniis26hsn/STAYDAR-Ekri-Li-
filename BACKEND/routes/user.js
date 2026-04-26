import express from 'express'
import {
deleteUser,
getUsers,
getUserById,
getUsersOfATown,
updateUser,
getUserRating
} from '../controllers/user.js';

const router = express.Router() ;

router.post('/user', createUser) 
router.delete('/user/:id' , deleteUser)
router.get('/user' , getUsers)

router.get('/user/:id' , getUserById)

router.get('/getUsersOfATown/:town' , getUsersOfATown)

router.put('/user/:id' , updateUser )

router.get('/userRating/:id' , getUserRating )

export default router ;


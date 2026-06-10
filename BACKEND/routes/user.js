import express from 'express'
import { verifyToken } from '../middleware/auth.js';
import {
deleteUser,
getUsers,
getUserById,
getUsersOfATown,
updateUser,
getUserRating,
getUserApparts
} from '../controllers/user.js';

const router = express.Router() ;


router.delete('/user/:id' , deleteUser)
router.get('/user' , getUsers)

router.get('/user/:id' , getUserById)
router.get('/getUserApparts',  verifyToken ,getUserApparts);

router.get('/getUsersOfATown/:town' , getUsersOfATown)

router.put('/user/me' ,  verifyToken,updateUser )

router.get('/userRating/:id' , getUserRating )

export default router ;


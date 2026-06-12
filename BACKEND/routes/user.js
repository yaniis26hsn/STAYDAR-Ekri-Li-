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

import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router() ;


router.delete('/user/:id',  verifyToken ,verifyAdmin, deleteUser)
router.get('/user',  verifyToken ,verifyAdmin , getUsers)

router.get('/user/:id' ,  verifyToken,verifyAdmin, getUserById)
router.get('/getUserApparts', verifyToken ,getUserApparts);

router.get('/getUsersOfATown/:town' , verifyToken,verifyAdmin, getUsersOfATown)

router.put('/user/me' ,  verifyToken,updateUser )

router.get('/userRating/:id' , verifyToken,verifyAdmin, getUserRating )


export default router ;


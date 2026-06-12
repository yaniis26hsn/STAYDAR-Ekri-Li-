import express from 'express'
import { verifyToken } from '../middleware/auth.js';
import {
deleteUser,
getUsers,
getUserById,
getUsersOfATown,
updateUser,
updateUserAdmin,
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
router.get('/userRating/:id' , verifyToken,verifyAdmin, getUserRating )

// here we need to start by the '/user/me'  before  '/user/:id' cz if we reverse
// the req '/user/me' will be captured by '/user/:id' as req.params.id = 'me'
router.put('/user/me' ,  verifyToken,updateUser )
router.put('/user/:id',verifyToken , verifyAdmin,updateUserAdmin)





export default router ;


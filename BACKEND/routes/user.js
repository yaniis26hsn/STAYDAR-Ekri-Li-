import express from 'express'
import {
createUser,
deleteUser,
getUsers,
getUserById,
getUsersOfATown,
updateUser,
getUserRating
} from '../controllers/user.js';

const router = express.Router() ;

router.post('api/v1/user', createUser) 
router.delete('api/v1/user/:id' , deleteUser)
router.get('api/v1/user' , getUsers)

router.get('api/v1/user/:id' , getUserById)

router.get('api/v1/getUsersOfATown/:town' , getUsersOfATown)

router.put('api/v1/user/:id' , updateUser )

router.get('api/v1/userRating/:id' , getUserRating )

export default router ;


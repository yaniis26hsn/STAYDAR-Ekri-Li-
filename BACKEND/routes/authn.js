import express from 'express'
import { 
    register ,
    login
} from '../controllers/authn.js'
const router = express.Router() ;

router.post('/login', login) ;
router.post('/register', register);
// OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { session: false }), 
    googleAuthCallback // Your controller function
);

export default router ;
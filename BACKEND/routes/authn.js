import express from 'express'
import passport from 'passport'

import { 
    register ,
    login,
    googleAuthCallback,
    me,
    
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
router.get('/me' , me) ;

export default router ;

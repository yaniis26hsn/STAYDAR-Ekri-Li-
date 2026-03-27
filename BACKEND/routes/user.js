import express from 'express'
import User from '../controllers/User.js';

const router = express.Router() ;

router.post('api/v1/user', async (req,res)=>{
    //TODO : adding new user , but i'll need that the cridintials (email/phone) doesn't already exist in the DB
    const newUser = new User(req.body) 
    // the default value of the rating should be null
    await newUser.save() ;
    res.send("the user was successfully added ") ;
    
}) 
router.delete('api/v1/user/:id' , async (req,res)=>{
    await User.findByIdAndDelete(req.params.id) ;
    res.send("user was successfuly deleted") ;
})
router.get('api/v1/user' , async (req,res)=>{
     const users = await User.find() ;
    res.send(users) ;
})

router.get('api/v1/user/:id' , async (req,res)=>{
     const user = await User.findById(req.params.id) ;
    res.send(user) ;
})

router.get('api/v1/getUsersOfATown/:town' , async (req,res)=>{
     const users = await User.find({town : req.params.town}) ;
    res.send(users) ;
})

router.put('api/v1/user/:id' , async (req,res)=>{
    const theUser = await User.findById(req.params.id) ;
    
    theUser.address = req.body.address ;
    theUser.username = req.body.username ;
    theUser.password = req.body.password ;
    theUser.phone = req.body.phone ;
    theUser.email = req.body.email ;
    theUser.contact = req.body.contact ;
    theUser.town = req.body.town ;
    res.send("succesfully updated") ;
} )

router.get('api/v1/userRating/:id' , async (req,res)=>{
  const theUser = await findById(req.params.id) ;

//   const theRating = theUser.
} )

export default router ;


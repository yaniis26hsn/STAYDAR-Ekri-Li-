import User from '../models/User.js';
import Appartement from '../models/Appartement.js'
export const deleteUser = async (req,res)=>{
    await User.findByIdAndDelete(req.params.id) ;
    res.send("user was successfuly deleted") ;
}
export const getUsers = async (req,res)=>{
     const users = await User.find() ;
    res.send(users) ;
}


export const getUserById = async (req,res)=>{
     const user = await User.findById(req.params.id) ;
    res.send(user) ;
}

export const getUsersOfATown = async (req,res)=>{
     const users = await User.find({town : req.params.town}) ;
    res.send(users) ;
}

export const updateUser = async (req,res)=>{
    const userId = req.user.userId;
    const theUser = await User.findById(userId) ;
    
    
    theUser.address = req.body.address ;
    theUser.username = req.body.username ;
    theUser.lname = req.body.lname;
    theUser.fname = req.body.fname ;
    theUser.phone = req.body.phone ;
    theUser.email = req.body.email ;
    theUser.contact = req.body.contact ;
    theUser.town = req.body.town ;
    await theUser.save() ;
    res.send("succesfully updated") ;
} 
export const getUserApparts = async (req,res)=>{
     
    const userId = req.user.userId;
    const apps = await Appartement.find({ownerId:userId}) ;
    res.status(200).json(apps) ;
    // frontend must store the id of the apparts so that he can delete it . sending the token is also necessary for security
    // to make sure that appart id won't be enough to delete it ,
}
export const getUserRating = async (req,res)=>{
  const theUser = await findById(req.params.id) ;

//   const theRating = theUser.
} 

export const checkMe = async (req,res)=>{
    
}
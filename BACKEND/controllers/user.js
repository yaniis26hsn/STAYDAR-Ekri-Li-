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
     if (!user) return res.status(404).send("user not found");
    res.send(user) ;
}

export const getUsersOfATown = async (req,res)=>{
     const users = await User.find({town : req.params.town}) ;
    res.send(users) ;
}

export const updateUser = async (req,res)=>{

    const userId = req.user.userId;
    const theUser = await User.findById(userId) ;
    if (!theUser) return res.status(404).send("user not found");
    
    applyUserUpdates(theUser,req.body)
    await theUser.save() ;
    res.send("succesfully updated") ;
} 
export const updateUserAdmin = async (req,res)=>{
    
    const theUser = await User.findById(req.params.id) ;
    if (!theUser) return res.status(404).send("user not found");
    
    applyUserUpdates(theUser,req.body)
    
    await theUser.save() ;
    res.send("succesfully updated") ;
} 
const applyUserUpdates = (user, body) => {
  user.address = body.address;
  user.username = body.username;
  user.lname = body.lname;
  user.fname = body.fname;
  user.phone = body.phone;
  user.email = body.email;
  user.contact = body.contact;
  user.town = body.town;
};
export const getUserApparts = async (req,res)=>{
     
    const userId = req.user.userId;
    const apps = await Appartement.find({ownerId:userId}) ;
    res.status(200).json(apps) ;
    // frontend must store the id of the apparts so that he can delete it . sending the token is also necessary for security
    // to make sure that appart id won't be enough to delete it ,
}
export const getUserRating = async (req,res)=>{
    // we could update the rating only when this was called ,
    //  but since we assume there will few rates it s okay to update 
    // the rating with each rate for this owner and this will just return the value 

  const theUser = await User.findById(req.params.id) ;
  if(!theUser) return res.status(404).send("not found")
  res.status(200).send({rating:theUser.rating}) ;

} 

export const checkMe = async (req,res)=>{
    
}
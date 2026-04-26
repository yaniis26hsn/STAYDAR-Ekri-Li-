import User from '../models/User.js';



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
    const theUser = await User.findById(req.params.id) ;
    
    theUser.address = req.body.address ;
    theUser.username = req.body.username ;
    theUser.password = req.body.password ;
    theUser.lname = req.body.lname;
    theUser.fname = req.body.fname ;
    theUser.phone = req.body.phone ;
    theUser.email = req.body.email ;
    theUser.contact = req.body.contact ;
    theUser.town = req.body.town ;
    res.send("succesfully updated") ;
} 

export const getUserRating = async (req,res)=>{
  const theUser = await findById(req.params.id) ;

//   const theRating = theUser.
} 

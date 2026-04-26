import bcrypt from 'bcrypt'
import User from '../models/User.js';

export const register = async (req,res)=>{
  try{
    const data = req.body ;    
        const user = await User.findOne({ email: data.email});
        if(user) return res.status(400).send("wrong credintials") ;
        // TODO in front end : suggesting the user to login instead or for security just say error
        // to make sure that no one will know if a email is using the website(for more security)

       data.password = await bcrypt.hash(data.password,10) ;
       data.rating = null ;  // the default value of the rating should be null 
    const newUser = new User(data) ;
    await newUser.save() ;
    res.status(201).send("the user was successfully added ") ;
    
   
  }catch(err){
    res.status(500).send({error : err.message})  ;
  }
}
  export const login = async (req,res)=>{
    try{
     const data = req.body ;    
        const user = await User.findOne({ email: data.email});
        if(!user) return res.status(400).send("wrong credintials") ;

        const passwordMatch = await bcrypt.compare(data.password ,user.password ) ;
        
        if(passwordMatch){
            res.send("successful login") ;
         // TODO : use JWT 
        }else{
             return res.status(400).send("wrong credintials") ;
           // using the same message for all (non server side) errors will be more secure , the attacker won't know the source of the error
        }

    }catch(err){
    res.status(500).send({error : err.message})  ;
    }
  
}
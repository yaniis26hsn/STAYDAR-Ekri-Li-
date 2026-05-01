import bcrypt from 'bcrypt'
import User from '../models/User.js';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
 const SECRET = process.env.JWT_SECRET;


export const register = async (req,res)=>{
  try{
    const {
  email,
  password: plainPwd,
  fname,
  lname,
  username,
  address,
  town,
  phone,
  contact
} = req.body;  
        const user = await User.findOne({ email: email});
        if(user) return res.status(400).send("wrong credintials") ;
        // TODO in front end : suggesting the user to login instead or for security just say error
        // to make sure that no one will know if a email is using the website(for more security)

     const hashedPwd = await bcrypt.hash(plainPwd,10) ;
       // the default value of the rating should be null 
    const newUser = new User({
  email,
  password:hashedPwd,
  fname,
  lname,
  username,
  address,
  town,
  phone,
  contact
}) ;
    await newUser.save() ;
    res.status(201).send("the user was successfully added ") ;
    
   
  }catch(err){
    res.status(500).send({error : err.message})  ;
  }
}
  export const login = async (req,res)=>{
    try{
     const {email , password} = req.body ;    
     if(!email || !password) return res.status(400).send("mising fields")
        const user = await User.findOne({ email: email});
        if(!user) return res.status(401).send("wrong credintials") ;

        const passwordMatch = await bcrypt.compare(password ,user.password ) ;
        
        if(passwordMatch){
            const token = jwt.sign(
               { userId: user.id },
               SECRET ,
               {expiresIn : "1h"}
            )
            res.json({token}) ;
        }else{
             return res.status(401).send("wrong credintials") ;
           // using the same message for all (non server side) errors will be more secure , the attacker won't know the source of the error
        }

    }catch(err){
    res.status(500).send({error : err.message})  ;
    }
  
}
export const googleAuthCallback = (req, res) => {
    // Passport attaches the user found/created in the config to req.user
    const token = jwt.sign(
        { userId: req.user.id },
        SECRET,
        { expiresIn: "1h" }
    );

    // Use the URL fragment so the token is not sent back to servers in the query string.
    res.redirect(`${process.env.FRONTEND_URL}#token=${token}`);
};


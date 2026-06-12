

export const verifyAdmin = (req,res,next)=> {
 if(req.user?.role === "admin"){
    next() ;
 }else{
    res.status(403).send("unauthorized") 
 }

}
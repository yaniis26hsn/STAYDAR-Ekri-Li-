

export const ifAuthenticated =  (req, res, next) => {
    const header = req.headers.authorization ;
    if(!header) return res.status(401).send("missing header") ;

    const token = header.split(" ")[1] ;
    try{
       const payload =  jwt.verify(token , SECRET) ;
        req.user = payload ; 
       next() ;
    }catch{
        return res.status(403).send("invalid token") ;
    
    }
   

}
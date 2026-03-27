import mongoose from 'mongoose'


const ratingSchema = new mongoose.Schema({
    userID : String ,
    AppartementID : String ,
    theRating : Number ,
    date : Date 
})

ratingSchema.index(
  { userID: 1, AppartementID: 1 },
  { unique: true }
)
export default mongoose.model("Rating" , ratingSchema) ;
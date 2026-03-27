import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
  address: String,
  town : String ,
  username : String ,
  password : String , // hashed pwd 
  rating : {type :Number,default: null} , // the average of the ratings of his properties 
  // when it is null , in the ui we show 'not rated yet' 
  email : String ,
  phone : String ,
  contact : [String] // a links to a whatsupp or facebook ... accounts where you can contact it 
});

export default mongoose.model("User",  UserSchema);
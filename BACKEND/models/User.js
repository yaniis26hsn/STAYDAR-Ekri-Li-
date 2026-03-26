import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
  address: String,
  town : String ,
  username : String ,
  password : String , // hashed pwd 
  rating : Number , // the average of the ratings of his properties
  email : String ,
  phone : String ,
  contact : [String] // a links to a whatsupp or facebook ... accounts where you can contact it 
});

export default mongoose.model("User",  UserSchema);
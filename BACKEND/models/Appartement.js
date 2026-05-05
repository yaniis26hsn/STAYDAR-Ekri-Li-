import mongoose from "mongoose";

const AppartementSchema = new mongoose.Schema({
  address: String, // this is the address inside a the town 
  town : String ,
  price: Number,
  surface: Number ,
  description : String , // it is provided by the owner 
  type: String ,
  rateSum : {type :Number , default: 0} ,
  ratersNbr : {type :Number , default: 0} ,
  ownerId : String ,
  coordX : Number ,
  coordY : Number 
});

export default mongoose.model("Appartement", AppartementSchema);
import mongoose from "mongoose";

const AppartementSchema = new mongoose.Schema({
  address: String, // this is the address inside a the town 
  town : String ,
  price: Number,
  surface: Number ,
  type: String ,
  rateSum : {type :Number , default: null} ,
  ratersNbr : {type :Number , default: null} ,
  ownerId : String ,
  coordX : Number ,
  coordY : Number 
});

export default mongoose.model("Appartement", AppartementSchema);
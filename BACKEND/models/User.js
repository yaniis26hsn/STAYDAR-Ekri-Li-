import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
  address:  {
    type : String ,
    maxlength : [35 , 'the length is limited to 35']
  } ,
  town :  {
    type : String ,
    maxlength : [35 , 'the length is limited to 35']
  } ,
  fname : {
    type : String ,
    maxlength : [35 , 'the length is limited to 35']
  } ,
  lname :  {
    type : String ,
    maxlength : [35 , 'the length is limited to 35']
  } ,
  username : {
    type : String ,
    trim : true ,
     maxlength : [35 , 'the length is limited to 35']
  } ,

  provider: {
  type: String,
  enum: ["local", "google"],
  default: "local"
} ,

  password : {
    type : String ,
    minlength: [8 , "the length is not enough"] ,
    required : function(){
      return this.provider === "local" ;
    }
  } ,
  googleId : {
    sparse : true ,
    type : String , 
    unique : true ,
    required : function() {return this.provider === "google"}
  } ,

  rating : {type :Number,default: null } , // the average of the ratings of his properties 
  // when it is null , in the ui we show 'not rated yet' 

  email : {
    type : String ,
     unique :true ,
     trim : true ,
     lowercase : true ,
    required : [true , 'user must provide an email'] ,
    maxlength : [35 , 'the length is limited to 35']
  } ,
  phone :  {
    type : String ,
    maxlength : [15 , 'the length is limited to 15']
  } ,
  contact : {
     type: [String],
    // maxlength : [150 , 'the length is limited to 150']
    validate: [arr => arr.length <= 5, 'Max 5 contact links']
  
  }  // a links to a whatsupp or facebook  ... accounts where you can contact it or maybe phone number too
 
}
, {timestamps: true}

);

export default mongoose.model("User",  UserSchema);
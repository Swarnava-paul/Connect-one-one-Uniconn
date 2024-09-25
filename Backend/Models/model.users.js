const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
day: { type: String, required: true },
year:{type:String,required:true},
month:{type:String,required:true},
startTime: { type: String, required: true },
endTime: { type: String, required: true }
})

const userSchema = new mongoose.Schema({
name : {type : String , required : true},
email : {type : String , required : true},
googleId : {type:String,required:true},
oAuthAccessToken : {type : String , required : true},
availability : [availabilitySchema],
sharable_link : {type : String , default : false }
},{versionKey:false,timestamps:true})

const UserModel = mongoose.model('User',userSchema)

module.exports = UserModel;

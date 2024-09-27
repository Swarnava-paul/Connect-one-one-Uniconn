const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
month:{type:Number,required:true},
date:{type:Number,required:true},
slots : [
    {start : {type : String} , end : {type: String}}
]
})

const userSchema = new mongoose.Schema({
name : {type : String , required : true},
email : {type : String , required : true},
googleId : {type:String,required:true},
oAuthAccessToken : {type : String , required : true},
oAuthRefreshToken : {type:String},
availability : [availabilitySchema],
sharable_link : {type : String , default : false },
timeZone : {type:String}
},{versionKey:false,timestamps:true})

const UserModel = mongoose.model('User',userSchema)

module.exports = UserModel;

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
oAuthRefreshToken : {type:String,required:true},
availability : [availabilitySchema],
sharable_link : {type : String , required : true },
timeZone : {type:String , required: true}
},{versionKey:false,timestamps:true})

const UserModel = mongoose.model('User',userSchema)

module.exports = UserModel;

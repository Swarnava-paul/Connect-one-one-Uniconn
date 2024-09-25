const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
name : {type : String , required : true},
email : {type : String , required : true},
oAuthAccessToken : {type : String , required : true},
availability : {type : Array , default : []},
sharable_link : {type : Boolean , default : false }
},{versionKey:false,timestamps:true})

const UserModel = mongoose.model('User',userSchema)

module.exports = UserModel;
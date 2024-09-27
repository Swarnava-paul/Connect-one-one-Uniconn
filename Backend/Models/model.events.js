const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({

    sessionWith : {name : {type : String , required : true}, _id : {type: String , required : true} 
    ,email : {type : String , required : true}} ,
    
    bookerInfo : {bookerName : {type : String , required : true}  , bookerEmail : {type : String , required : true}},
    sessionInfo : {
    location : {type : String , required : true},
    meetingLink : {type :String,required:true},
    dateAndTime : {type : String , required : true}
   }
});

const EventModel = mongoose.model('Event',eventSchema);

module.exports = EventModel;
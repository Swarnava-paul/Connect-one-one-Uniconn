const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({

    hostInfo : {name : {type : String , required : true}, id : {type: String , required : true} 
    ,email : {type : String , required : true}} ,
    
    bookerInfo : {bookerName : {type : String , required : true}  , bookerEmail : {type : String , required : true}},
    sessionInfo : {
    location : {type : String , required : true},
    meetingLink : {type :String,required:true},
    StartDateAndTime : {type : String , required : true},
    endDateAndTime : {type : String , required : true}
   }
});

const EventModel = mongoose.model('Event',eventSchema);

module.exports = EventModel;
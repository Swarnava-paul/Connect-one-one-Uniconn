const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({

    sessionWith : {name : {type : String , required : true}, _id : {type: String , required : true} 
    ,email : {type : String , required : true}} ,
    
    bookerInfo : {name : {type : String , required : true}  , email : {type : String , required : true}},
    sessionInfo : {
    location : {type : String , required : true},
    date : {type : String , required : true},
    time : {type : String , required : true}
   }
});

const EventModel = mongoose.model('Event',eventSchema);

module.exports = EventModel;
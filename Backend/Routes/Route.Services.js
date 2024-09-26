const express = require('express');

const ServiceRouter = express.Router();
const {google}= require('googleapis');
const moment = require('moment-timezone')
// authentication check middleware
const checkAuthentication = require('../Middlewares/Midddleware.CheckAuthentication');
// Model
const EventModel = require('../Models/model.events');
const UserModel = require('../Models/model.users');

// mmodules 
const ConvertTimeZoneToUtc = require('../Modules/Module.ConvertTimezoneToUtc')

ServiceRouter.get('/events',checkAuthentication,async(req,res)=>{
 
    try {
      const {user} = req; // from auth middleware
      const events = await EventModel.find({'sessionWith._id':user.id});

      if(events.length == 0) {
        return res.status(404).json({message:"No Events Found",response:true})
      }
      
      res.status(200).json({response:true,message:"Events Found",events});

    }catch(error) {
        res.status(500).json({message:"Internal Server Error"})
    }
})
// this endpoint is managing retrive all the  events from database
// we need to call this api in sessions section on those user who are 
// taking one to one sessions


ServiceRouter.post('/sharableLink',checkAuthentication,async(req,res)=>{

    try {
       const {user} = req;
       const createSharableLink = await UserModel.updateOne({_id:user.id},
       {$set:{sharable_link:`http://localhost:5173/sharable?${user.id}`}})

       if(createSharableLink.modifiedCount == 0) {
         return res.status(500).json({message:"Failed to Generate Sharable Link"})
       }

       const {sharable_link} = await UserModel.findOne({_id:user.id})
       res.status(200).json({response:true,message:"Sharable Link Generated Successful",sharable_link});

    }catch(error) {
        console.log(error)
        res.status(500).json({message:"Internal Server Error"})
    }
}) 
// this endpoint is handeling generate sharable link by using this link anyone in future will able to
// book an one to one session with this person

ServiceRouter.patch('/slots',checkAuthentication,async(req,res)=>{

    try {
       const {slots} = req.body;
       const {user:{id}} = req; // from auth middleware

       if(!slots) {
        return res.status(404).json({message:"Please Provide Slots to update Existing Slots or create"})
       }

       const updateOrCreateSlots = await UserModel.updateOne({_id:id},{$set:{availability:slots}});
       
       if(updateOrCreateSlots.modifiedCount == 0) {
        return res.status(500).json({message:"Failed to Update availability Slots try again Later"})
       }

       res.status(200).json({message:"Slots Updated Successful"});

    }catch(error) {
        res.status(500).json({message:"Internal Server Error"});
    }
})
// this endpoint is handeling create or replace availability slots

ServiceRouter.get('/configure-session',async(req,res)=>{

  try {
    const {id} = req.query; // extracts id of booking with person

    const getInfo_for_session = await UserModel.findOne({_id:id});

    const {name,email,availability} = getInfo_for_session;

    if(!getInfo_for_session) {
     return res.status(404).json({message:"Sharable link is not Valid of No Host Found"})
    }

    res.status(200).json({
      response:true,
      message:"Successful",
      info : {
        name,email,availability
      }
    })

  }catch(error) {
    res.status(500).json({message:"Internal Server Error"});
  }
})
// this above route handle request for return data to book a session 
//data like booking with person availability , email , name etc.. in front-end we will use this to
// 


ServiceRouter.post('/book-session',async(req,res)=>{
 
  try {
   const {id:bookingWithPersonId,startTime,bookerEmail,bookerName,bookerTimeZone} = req.body;
    
   const findHost = await UserModel.findOne({_id:bookingWithPersonId});

   if(!findHost) {
    return res.status(404).json({message:"Host Not Found Try again with Correct Sharable Link"})
   }


   
   const {name,email,oAuthAccessToken,oAuthRefreshToken, timeZone : hostTimeZone} = findHost

   const oAuth2Client = new google.auth.OAuth2(
    process.env.Google_Auth_ClientId,
    process.env.Google_Auth_Client_Secret
   );

       
    oAuth2Client.setCredentials({
    access_token: oAuthAccessToken,
    refresh_token : oAuthRefreshToken
  });

  // -->> below code are responsible for correctly setting up the meeting in correct data and time

   // Step 1: Convert the start time from the booker's time zone (e.g., America/New_York) to UTC
   const utcStartTime = moment.tz(startTime, bookerTimeZone).utc().format(); // This is UTC time
   
   const hostStartTime = moment.tz(utcStartTime, 'UTC').tz(hostTimeZone).format(); // Convert UTC to host's timezone
   const hostEndTime = moment.tz(utcStartTime, 'UTC').tz(hostTimeZone).add(30, 'minutes').format(); // 30 mins later

   
  // <<--

   const calender = google.calendar({version:'v3',auth:oAuth2Client});
   const event = {
    summary : `Session With ${bookerName} email ${bookerEmail}`,
    start : {dateTime : hostStartTime , timeZone :hostTimeZone},
    end: {dateTime : hostEndTime , timeZone : hostTimeZone},
    conferenceData: {
      createRequest: { requestId: 'unique-request-id' } 
    }
   }

   const eventResponse = calender.events.insert({
     calendarId: 'primary',
     resource: event,
     conferenceDataVersion: 1,
   })
   // above final event response

   
   eventResponse
   .then((d)=>{
    return res.status(200).json({response:true,
    message:"Session Scheduled Successful",
    bookingWithPersonInfo : {
      name,email
    },
    bookingInfo : {
      location : "Google Meet",
      meetingLink : d.data.hangoutLink,
      meetingDate : hostStartTime,
      meetingDuration : "30 Minutes"
    }
  }) // in success of meeting scheduling
   
  res.status(500).json({message:"Failed to Book Session"})
  // in case if any error and meeting is not scheduled

 })

  }catch(error) {
   res.status(500).json({message:"Internal Server Error"});
  }

})

module.exports = ServiceRouter;
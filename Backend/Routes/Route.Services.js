const express = require('express');
const fs = require('node:fs')
const path = require('path')
const ServiceRouter = express.Router();
const {google}= require('googleapis');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer')
// authentication check middleware
const checkAuthentication = require('../Middlewares/Midddleware.CheckAuthentication');
// Model
const EventModel = require('../Models/model.events');
const UserModel = require('../Models/model.users');

// mmodules 
const ConvertTime = require('../Modules/HostToBookerTimeConverter')

ServiceRouter.get('/getUserInfo',checkAuthentication,async(req,res)=>{
  try {
  const {id} = req.user;
  const findUser = await UserModel.find({_id:id});
  res.status(200).json({message:"User Fetched",name:findUser[0].name,email:findUser[0].email,
    sharable_link:findUser[0].sharable_link,id:findUser[0]._id,timeZone:findUser[0].timeZone})
  
  }catch (error) {
   res.status(500).json({message:"Internal Server Error"})
  }
})
// by using this endpoint we are able to check if user is a new or old depending on sharable link false 
// and also get details like id for comunication 



ServiceRouter.get('/events',checkAuthentication,async(req,res)=>{
 
    try {
      const {user:{id}} = req; // from auth middleware
      const events = await EventModel.find({'hostInfo.id':id});

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
       {$set:{sharable_link:`${process.env.Sharable_Link}?${user.id}`}})

       if(createSharableLink.modifiedCount == 0) {
         return res.status(500).json({message:"Failed to Generate Sharable Link"})
       }

       const {sharable_link} = await UserModel.findOne({_id:user.id})
       res.status(200).json({response:true,message:"Sharable Link Generated Successful",sharable_link});

    }catch(error) {
        res.status(500).json({message:"Internal Server Error"})
    }
}) 
// this endpoint is handeling generate sharable link by using this link anyone in future will able to
// book an one to one session with this person

ServiceRouter.post('/slots',checkAuthentication,async(req,res)=>{

    try {
       const {newAvailabilityDate} = req.body;
       const {user:{id}} = req; // from auth middleware

       if(!newAvailabilityDate) {
        return res.status(404).json({message:"Please Provide Date with Slots or create Availability"})
       }

       const updateOrCreateSlots = await UserModel.updateOne({_id:id},{$push:{availability:newAvailabilityDate}});
       
       if(updateOrCreateSlots.modifiedCount == 0) {
        return res.status(500).json({message:"Failed to Update availability Slots try again Later"})
       }

       res.status(200).json({message:"Slots Updated Successful"});

    }catch(error) {
        res.status(500).json({message:"Internal Server Error"});
    }
})
// this endpoint is handeling creating slots 

ServiceRouter.get('/configure-session',async(req,res)=>{

  try {
    const {id,t} = req.query; // extracts id of booking with person
    //const {bookerTimeZone} = req.body;
    const getInfo_for_session = await UserModel.findOne({_id:id});

    const {name,email,availability,timeZone:hostTimeZone} = getInfo_for_session;

    if(!getInfo_for_session) {
     return res.status(404).json({message:"Sharable link is not Valid of No Host Found"})
    }
     
    const convertedAvailability = ConvertTime(availability,hostTimeZone,t); //bookerTimeZone 
    // this above function converts hosts each slot start and end time to that time in booker timezone


    res.status(200).json({
      response:true,
      message:"Successful",
      info : {
        name,email,convertedAvailability
      }
    })
  
  }catch(error) {
    res.status(500).json({message:"Internal Server Error"});
  }
})
// this above route handle request for return data to book a session 
//data like booking with person availability , email , name etc.. in front-end we will use this to
// this route will also use in future for get available slots for host to display session already created dates


ServiceRouter.post('/book-session',async(req,res)=>{
 
  try {
   const {id:bookingWithPersonId,startTime,bookerEmail,bookerName,bookerTimeZone,slotId,availabilityId} = req.body;
    
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
   .then(async(d)=>{
    // remove the slot timing after booked
    
    const {availability:updatedAvailability} = await UserModel.findOneAndUpdate(
      {
        _id: bookingWithPersonId, // Find the user by ID
        "availability._id": availabilityId // Match the specific availability document if necessary
      },
      {
        $pull: {
          "availability.$.slots": { _id: slotId } // Pull the specific slot by its ID
        }
      },
      { new: true } // Return the updated document
    ); // removes that slot after booking

    await UserModel.updateOne({_id:bookingWithPersonId},{$set:{availability:updatedAvailability}}) // replace
    // new updated slot except of that slot that is booked 
    
    await EventModel.create({
       hostInfo : {name,email,id:bookingWithPersonId},
       bookerInfo : {bookerName,bookerEmail},
       sessionInfo : {
        location : 'Google Meet',
        meetingLink : d.data.hangoutLink,
        StartDateAndTime : hostStartTime,
        endDateAndTime : hostEndTime
       }
    })
    
    const convertedHostTimeToBookerTimeZone = moment.tz(utcStartTime, 'UTC').tz(bookerTimeZone).format();
    const convertedHostEndTimeToBookerTimeZone = moment.tz(utcStartTime, 'UTC').tz(bookerTimeZone).add(30, 'minutes').format(); // 30 mins later

    return res.status(200).json({response:true,
    message:"Session Scheduled Successful",
    bookingWithPersonInfo : {
      name,email
    },
    bookingInfo : {
      location : "Google Meet",
      meetingLink : d.data.hangoutLink,
      meetingStartDate_Time : convertedHostTimeToBookerTimeZone,
      meetingEndDate_Time : convertedHostEndTimeToBookerTimeZone,
      meetingDuration : "30 Minutes"
    }
  }) // in success of meeting scheduling
   
 }).catch((e)=>{
   
  return res.status(500).json({message:"Failed to Book Session"})
 })
 // in case if any error and meeting is not scheduled

  }catch(error) {
   res.status(500).json({message:"Internal Server Error"});
  }

})


module.exports = ServiceRouter;
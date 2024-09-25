const express = require('express');

const ServiceRouter = express.Router();

// authentication check middleware
const checkAuthentication = require('../Middlewares/Midddleware.CheckAuthentication');
// Model
const EventModel = require('../Models/model.events');
const UserModel = require('../Models/model.users');


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

module.exports = ServiceRouter;
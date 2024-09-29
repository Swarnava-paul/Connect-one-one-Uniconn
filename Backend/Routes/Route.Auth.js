
const express = require('express');

const AuthRouter = express.Router() ;
// userModel
const UserModel = require('../Models/model.users');

// modules
const generateToken = require('../Modules/Module.generateJwtToken')
// middleware
const checkAuthentication = require('../Middlewares/Midddleware.CheckAuthentication')

var GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const session = require('express-session');

AuthRouter.use(session({ secret:process.env.Session_Secret_Key, resave: false, saveUninitialized: true }));
AuthRouter.use(passport.initialize());
AuthRouter.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.Google_Auth_ClientId,
    clientSecret: process.env.Google_Auth_Client_Secret,
    callbackURL: process.env.Google_Auth_Callback_uri,
  },
  async function(accessToken, refreshToken, profile, cb) {

    
    const email = profile.emails[0].value;
    try {
      let findUser = await UserModel.findOne({email:email});
      if(!findUser) {
        const user = await UserModel.create({name:profile.displayName,email:email,googleId:profile.id,oAuthAccessToken:accessToken,
          oAuthRefreshToken : refreshToken
     });
        return cb(null,user)
      } else {
        await UserModel.updateOne({email:email},{$set:{oAuthAccessToken:accessToken,oAuthRefreshToken:refreshToken}});
        return cb(null,findUser)
      }
    } catch(error) {
      return cb(error)
    }
  }
));


passport.serializeUser(function(user, cb) {
    cb(null, user.googleId);
  }); // for store session state 
  
passport.deserializeUser(async function(id, cb) {
    const user = await UserModel.findOne({googleId:id});
    cb(null, user);
}); // for retrive user from the session by using 


AuthRouter.get('/auth/google',
    passport.authenticate('google', { scope: ['profile','email','https://www.googleapis.com/auth/calendar'], accessType: 'offline'}))

AuthRouter.get('/auth/google/callback', 
        passport.authenticate('google', { failureRedirect: '/error' }),
        async function(req, res) {
          try {
            const {name,email} = req.user;
            const firstName = name.split(' ')[0];
            const token = generateToken({id:req.user._id});
            res.status(200).json({message:"Login Successful",name:firstName,email,token}) // temporary for test

             const production = `https://dell-india.netlify.app?token=${token}`;
            const development = `http://localhost:4000?token=${token}`
            //res.redirect(development) // redirected to home page of front-end

          }catch(e) {
           res.status(500).json({message:"Internal server Error"})
          } 
});

AuthRouter.get('/healthCheck',(req,res)=>{
    res.end('Auth Router is Ok')
});
// endpoint for auth Router health Check



module.exports = AuthRouter;
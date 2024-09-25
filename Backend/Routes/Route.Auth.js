
const express = require('express');

const AuthRouter = express.Router() ;
// userModel
const UserModel = require('../Models/model.users');

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
    callbackURL: 'http://localhost:4000/login/auth/google/callback', // subject to change 
  },
  async function(accessToken, refreshToken, profile, cb) {
    const email = profile.emails[0].value;
    try {
      let findUser = await UserModel.findOne({email:email});
      if(!findUser) {
        const user = await UserModel.create({name:profile.displayName,googleId:profile.id,email:email});
        return cb(null,user)
      } else {
        return cb(null,findUser)
      }
    } catch(error) {
      return cb(error)
    }
  }
));

AuthRouter.get('/healthCheck',(req,res)=>{
    res.end('Auth Router is Ok')
});
// endpoint for auth Router health Check



module.exports = AuthRouter;
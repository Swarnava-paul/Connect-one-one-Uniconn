require('dotenv').config()

const express = require('express'); 
const database = require('./Config/Connection.Database');
const cors = require('cors');

const server = express(); // express server

// routes
const AuthRouter = require('./Routes/Route.Auth'); 
const ServiceRouter = require('./Routes/Route.Services');
// <<- routes

server.use(express.json()) ; // for receiving incoming request body


server.get('/server/healthCheck',(req,res)=>{
  res.end("Server is ok");
})
// server health check route

server.use('/login',AuthRouter) // auth router Handelling login and register with Google
server.use('/api/v1',ServiceRouter)

server.listen(process.env.PORT,async()=>{
    
    try{
      console.log(`server is running on port ${process.env.PORT}`);
      database.connect; // method to stablish connection with database
    }catch(error) {
        console.log(error);      
    }
}) // listening to server

const mongoose = require('mongoose')

let database = {
    get connect () {

        (async ()=> {
          try {
            await mongoose.connect(process.env.DATABASE_URL); // database connection
            console.log('Connection with Database Successful'); 
          }catch(error) {
            console.log(`Error During Stablish Database Connection ${error}`) // log error if any
          }
         }
        )()
    }
}

Object.freeze(database); // freeze the database object to prevent any manupulation over it

module.exports = database;
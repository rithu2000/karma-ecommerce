const mongoose = require('mongoose')
require('dotenv').config()
// making connection
mongoose.connect(process.env.mongoose)

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
    console.log("Database Connection Successful!");
})
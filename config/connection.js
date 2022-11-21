const mongoose = require('mongoose')

// making connection
mongoose.connect('mongodb+srv://rithunlr1:1BMzjZjhyhTSISMv@cluster0.t0mutn0.mongodb.net/karma?retryWrites=true&w=majority')

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
    console.log("Database Connection Successful!");
})
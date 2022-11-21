const mongoose = require('mongoose');
const collection = require('../config/collection');

const Schema = mongoose.Schema

const userSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobno: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    access: {
        type: Boolean,
        required: true
    },
    address: [
        {
            firstName: String,
            lastName: String,
            number: Number,
            address: String,
            city: String,
            district: String,
            country: String,
            zipcode: Number
        }
    ]
})

module.exports = mongoose.model(collection.userCollection, userSchema)
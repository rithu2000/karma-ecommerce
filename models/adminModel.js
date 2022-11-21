const mongoose = require('mongoose');
const collection = require('../config/collection');

const Schema = mongoose.Schema

const adminSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model(collection.adminCollection, adminSchema)
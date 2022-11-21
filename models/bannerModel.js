const mongoose = require('mongoose');
const collection = require('../config/collection');

const Schema = mongoose.Schema

const bannerSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: Array,
        required: true
    },
    url:{
        type:String,

    },
    access: {
        type: Boolean,
        default:true
    }
})

module.exports = mongoose.model(collection.bannerCollection, bannerSchema)
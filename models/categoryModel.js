const mongoose = require('mongoose');
const collection = require('../config/collection');

const Schema = mongoose.Schema

const categorySchema = new Schema({

    category: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: Boolean,
        required: true
    }
})

module.exports = mongoose.model(collection.categoryCollection, categorySchema)
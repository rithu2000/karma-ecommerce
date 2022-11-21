const mongoose = require('mongoose');
const collection = require('../config/collection');

const Schema = mongoose.Schema

const orderSchema = new Schema({

    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    products: {},
    discount: {
        type: Number
    },
    total: {
        type: Number,
        required: true
    },
    address: {},
    paymentStatus: {
        type: String,
        required: true
    },
    orderStatus: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model(collection.orderCollection, orderSchema)
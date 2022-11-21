const mongoose = require('mongoose');
const collection = require('../config/collection');

const Schema = mongoose.Schema

const cartSchema = new Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products'
            },
            quantity: Number,
            name: String,
            price: Number,
        }
    ],
    total: {
        type: Number,
    }
})

module.exports = mongoose.model(collection.cartCollection, cartSchema)
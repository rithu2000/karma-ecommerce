const mongoose = require('mongoose');
const collection = require('../config/collection');

const Schema = mongoose.Schema

const wishlistSchema = new Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    myWish: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',

            }
        }
    ]
})

module.exports = mongoose.model(collection.wishlistCollection, wishlistSchema)
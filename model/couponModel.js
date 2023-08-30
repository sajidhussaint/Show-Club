const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
     
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }],
    code : {
        type : String,
        required : true
    },
    startingDate:{
        type: Date,
        required: true
    },
    expiryDate : {
        type : Date,
        required : true
    },
    discount : {
        type : Number,
        required : true
    },
    minimum : {
        type : Number,
        required : true
    },
    maximum : {
        type : Number,
        required : true
    },

    description:{
        type : String,
        required : true
    },
})

module.exports = mongoose.model('coupon' ,couponSchema)
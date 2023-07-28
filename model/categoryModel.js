const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
     
    name : {
        type : String,
        required : true
    },
    description:{
        type : String,
        required : true
    },
    blocked:{
        type:Boolean,
        required:true,
        default:false,
    } 
})

module.exports = mongoose.model('category' , categorySchema)
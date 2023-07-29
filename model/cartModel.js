const mongoose =require('mongoose')
const Product = require("../model/productModel");


const cartSchema =new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'user',
        required:true
    },
    product:[{
       product_Id:{ type:mongoose.Types.ObjectId,
        ref:'Products',
        require:true
    },
    quantity:{
        type:Number,
        default:1
    },
    total:{
        type:Number,
    },

    }],
    grandTotal: {
        type: Number,
      },

})

module.exports=mongoose.model("cart",cartSchema)
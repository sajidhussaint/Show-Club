const mongoose =require('mongoose')


const cartSchema =new mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        ref:'user',
        required:true
    },
    product:[{
       productId:{ type:mongoose.Types.ObjectId,
        ref:'product',
        require:true
    },
    quantity:{
        type:Number,
        default:1
    },
    price:{
        type:Number,
        default:0
    }

    }]

})

module.exports=mongoose.model("cart",cartSchema)
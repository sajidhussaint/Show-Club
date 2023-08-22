const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category:{
    type:mongoose.Types.ObjectId,
    ref:'category',
    requre:true
},
  price: {
    type: Number,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  image:{
    type:Array,
    required:true
},
  blocked: {
    type: Boolean,
    default: false,
  },
  offer : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'offer'
}
});

module.exports = mongoose.model("Products", productSchema);

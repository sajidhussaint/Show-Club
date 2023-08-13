const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: String,
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
});

module.exports = mongoose.model("Products", productSchema);

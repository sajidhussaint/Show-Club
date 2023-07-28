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
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Products", productSchema);

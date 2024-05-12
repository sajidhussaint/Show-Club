const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Types.ObjectId,
    ref: "category",
    requre: true,
  },
  gender: {
    type: String,
    required: false,
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
  image: {
    type: Array,
    required: true,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "offer",
  },
  review: [
    {
      user: {
        type: ObjectId,
        ref: "user",
      },

      review: {
        type: "String",
      },

      rating: {
        type: Number,
      },
    },
  ],
});

module.exports = mongoose.model("Products", productSchema);

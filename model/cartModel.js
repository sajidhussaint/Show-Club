const mongoose = require("mongoose");
const Products = require("../model/productModel");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "user",
  },
  product: [
    {
      product_Id: {
        type: mongoose.Types.ObjectId,
        ref: "Products",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        required: true,
      },
      total: {
        type: Number,
        required:true,
      },
    },
  ],
  grandTotal: {
    type: Number,
  },
  count: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model("cart", cartSchema);

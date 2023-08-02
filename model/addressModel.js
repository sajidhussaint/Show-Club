const mongoose = require("mongoose");

const userAddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },

  address: [
    {
      fname: {
        type: String,
        required: true,
        trim: true,
      },
      sname: {
        type: String,
        required: true,
        trim: true,
      },
      mobile: {
        type: Number,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
      },
      housename: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      district: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
      },

      pin: {
        type: String,
        required: true,
        trim: true,
      },
    },
  ],
});

module.exports = mongoose.model("userAddress", userAddressSchema);

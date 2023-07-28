const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mob: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Number,
    required: true,
  },
  is_verified: {
    type: String,
    default:0
  },
  token: {
    type: String,
    default: '',
  },
  is_blocked: {
    type: Boolean,
    required: true,
    default:false,
  },
  wallet: {
    type: Number,
    default:0
  },
  
});

module.exports=mongoose.model('user',userSchema)
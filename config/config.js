const mongoose = require("mongoose");
const sessionSecret = "mysessionsecret";
const dotenv=require('dotenv')


dotenv.config()

const mongoconnect = () => {
  mongoose
    .connect(process.env.MONGO_CONNECTION_STRING)
    .then(() => console.log("connected db"))
    .catch((err) => console.log(err.message));
};

module.exports = {
  sessionSecret,
  mongoconnect
};

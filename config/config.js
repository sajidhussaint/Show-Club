const mongoose = require("mongoose");
const sessionSecret = "mysessionsecret";

const mongoconnect = () => {
  mongoose
    .connect("mongodb://127.0.0.1:27017/SHOW-CLUB")
    .then(() => console.log("connected db"))
    .catch((err) => console.log(err.message));
};

module.exports = {
  sessionSecret,
  mongoconnect
};

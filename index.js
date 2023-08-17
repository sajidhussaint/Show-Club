const express = require("express");
const session = require("express-session");
const nocache=require('nocache')
const app = express();
const port = 3000;
const config = require("./config/config");
const userRoute = require("./router/userRoute");//userRoutes
const adminRoute = require("./router/adminRoute");//adminRoute


config.mongoconnect();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(nocache())
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
    }
  }));
app.use(express.static("public"));
app.set("view engine","ejs");
app.use("/",userRoute);
app.use('/admin', adminRoute);

app.use((req, res) => {
  res.status(404).render("error404");
});
app.listen(port, () => {
  console.log(`Server running on port:http://localhost:${port}`);
  console.log(`Server running on port:http://localhost:${port}/admin`);
});

const Product = require("../model/productModel");
const User = require("../model/userModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const session = require("express-session");
const randomstring = require("randomstring");
const cart = require("../model/cartModel");
const mongoose =require('mongoose')
const AddressDB = require("../model/addressModel");
const orderDB=require("../model/orderModel")
const twilio = require('twilio');

dotenv.config();
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);

let otp;
let email2;
let name2;

//bcrypt password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//nodemailer(function)
const sendVerifymail = async (name, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOption = {
      from:process.env.EMAIL_USER,
      to: email,
      subject: "For OTP verification",

      html:
        "<div style='font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2'>" +
        "<div style='margin:50px auto;width:70%;padding:20px 0'>" +
        "<div style='border-bottom:1px solid #eee'>" +
        "<a href='' style='font-size:1.4em;color: #F6511D;text-decoration:none;font-weight:600'>SHOW<a style='color: #F6511D;'>☰</a>CLUB</a>" +
        "</div>" +
        "<p style='font-size:1.1em'>Hi,</p>" +
        "<p>Thank you for choosing SHOW-CLUB. Use the following OTP to complete your Sign Up procedures. OTP is valid for few minutes</p>" +
        "<h2 style='background: #F6511D;margin: 0 auto;width: max-content;padding: 0 10px;color: white;border-radius: 4px;'>" +
        +otp +
        "</h2>" +
        "<p style='font-size:0.9em;'>Regards,<br />SHOW-CLUB</p>" +
        "<hr style='border:none;border-top:1px solid #eee' />" +
        "<div style='float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300'>" +
        "<p>Show Club Eco</p>" +
        "<p>1600 Ocean Of Heaven</p>" +
        "<p>Pacific</p>" +
        "</div>" +
        "</div>" +
        "</div>",
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("emai has been send to:", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//for reset password send mail(function)
const resetsendVerifymail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOption = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "For Reset password",
      //html:"<p> Hii  " +name+ "  please enter  " +otp+ "  as your OTP for verification </p>"
      // html:'<p>hi '+name+' ,please click here to<a href="http://localhost:3000/otp " '+email+' >varify</a> for verify and enter the '+otp+ ' </p>'
      html:
        "<p>hi " +
        name +
        ' ,please click here to <a href="http://localhost:3000/reset_password?token=' +
        token +
        '">Reset</a> your password </p>',
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("email has been send to:", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//home page
const loadHome = async (req, res) => {
  try {
    const session = req.session.user_id;
    console.log(session, "load home session");
    const product = await Product.find({ blocked: false });
    res.render("index", { activePage: "home", product, session });
  } catch (err) {
    console.log(err.message);
  }
};

//men page
const loadMen = async (req, res) => {
  try {
    res.render("men", { activePage: "men" });
  } catch (error) {
    console.log(error.message);
  }
};

//women page
const loadWomen = async (req, res) => {
  try {
    res.render("women", { activePage: "women" });
  } catch (error) {
    console.log(error.message);
  }
};

//about page
const loadAbout = async (req, res) => {
  try {
    res.render("about", { activePage: "about" });
  } catch (error) {
    console.log(error.message);
  }
};

//contact page
const loadContact = async (req, res) => {
  try {
    res.render("contact", { activePage: "contact" });
  } catch (error) {
    console.log(error.message);
  }
};

//wish-list page
const loadWishList = async (req, res) => {
  try {
    res.render("add-to-wishlist");
  } catch (error) {
    console.log(error.message);
  }
};

// orderComplete page
const loadOrderComplete = async (req, res) => {
  try {
    res.render("order-complete");
  } catch (error) {
    console.log(error.message);
  }
};

//login page
const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

//logout button(destory session)
const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

//userloginVerify
const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user based on the username or email
    const user = await User.findOne({ $or: [{ email }, { email: email }] });
    if (!user) {
      return res.render("login", { message: "Invalid username or password" });
    }

    // Check if the user's account is verified
    if (user.is_verified == 0) {
      return res.render("login", { message: "Account not verified" });
    }

    // Compare the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.render("login", { message: "Invalid username or password" });
    }
    // Set up a session or token for authentication (implement your own logic)
    req.session.user_id = user._id;
    res.render("men");
  } catch (err) {
    console.error("Error during sign in:", err);
    res.render("login", { message: "An error occurred during sign in" });
  }
};

// mobileOtp
const mobileOtp=async(req,res)=>{
  try {
    const inputEmail=req.body.inputEmail;
    const inputPassword=req.body.inputPassword;

    console.log(inputEmail,inputPassword);
    const userData = await User.findOne({ $or: [{ inputEmail }, { mob: inputEmail }] });
    if (!userData) {
      return res.render("login", { message: "Invalid username or password" });
    }

    // Check if the user's account is verified
    if (userData.is_verified == 0) {
      return res.render("login", { message: "Account not verified" });
    }
    
    const passwordMatch = await bcrypt.compare(inputPassword, userData.password);
    if (!passwordMatch) {
      return res.render("login", { message: "Invalid username or password" });
    }

    const otpMob = Math.floor(1000 + Math.random() * 9999);

    console.log('this is OTP:',otpMob);
    const user=userData._id
    console.log('this is userid:',user);

        // sendVerifymail(req.body.name, inputEmail, otpGenarated);
        // res.render("404", { inputEmail });
        res.json({success:true,otpMob,user})

    

      
  } catch (error) {
      console.log(error.message)
  }
}
// mobileotp(get)
const loadmobileOtp=async(req,res)=>{
  try {
    const mobOtp=req.query.mobOtp
    const user=req.query.user
console.log(mobOtp,'u',user);

const message = `Your OTP is: ${mobOtp}`;

twilioClient.messages
.create({
  body: message,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: '+918089555859',
})
.then((message) => {
  console.log(message.sid);
  res.render('mobileOtp',{mobOtp,user})
  // res.json({ success: true, message: 'OTP sent successfully!' });
})
.catch((error) => {
  console.error(error);
  res.status(500).json({ success: false, message: 'Failed to send OTP.' });
});



      
  } catch (error) {
      console.log(error.message)
  }
}


// mobileotpVerify(post)
const mobileotpVerify=async(req,res)=>{
  try {
    const mobOtp=req.query.mobOtp;
    const user=req.query.user;
    const inputOtp=req.body.otp

if(mobOtp==inputOtp){
  req.session.user_id = user;
  res.redirect('/')
}else{
res.render('mobileOtp',{message:'An error occurred during verification',mobOtp,user})
}


      // res.render('mobileOtp',{mobOtp})
  } catch (error) {
      console.log(error.message)
  }
}

//register pageload
const loadRegister = async (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    console.log(error.message);
  }
};
//register verify post
const verifyUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);
    const email = req.body.email;
    const name = req.body.name;
    const alreyMail = await User.findOne({ email: email });
    email2 = email;
    name2 = name;

    if (alreyMail) {
      res.render("register", { message: "EMAIL ALREADY EXIST " });
    } else {
      const data = new User({
        name: req.body.name,
        email: req.body.email,
        mob: req.body.mob,
        password: spassword,
        is_admin: 0,
        is_verified: 0,
        is_blocked: false,
      });

      const Udata = await data.save();

      if (Udata) {
        // Generate a random 4-digit OTP
        const otpGenarated = Math.floor(1000 + Math.random() * 9999);
        otp = otpGenarated;

        sendVerifymail(req.body.name, req.body.email, otpGenarated);
        res.render("otpReminder", { email });
      } else {
        res.render("register", { alert: "registration not completed" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// load OTP
const loadOtp = async (req, res) => {
  try {
    res.render("otpReminder");
  } catch (error) {
    console.log(error.message);
  }
};

// otpValidation(POST)
const otpValidation = async (req, res) => {
  try {
    const otpinput = req.body.otp;
    const email = req.body.email;
    if (otpinput == otp) {
      const userData = await User.findOneAndUpdate(
        { email: email2 },
        { $set: { is_verified: 1 } }
      );
      res.render("login", {
        userData,
        email2,
        message: "otp verification successfully..!!!",
      });
    } else res.render("otpReminder", { message: "incorrect otp!!!" });
  } catch (err) {
    console.error("Error during verification:", err);
    res.render("otpReminder", {
      message: "An error occurred during verification",
    });
  }
};

//forgetload page
const forgotLoad = async (req, res) => {
  try {
    res.render("forget_password");
  } catch (error) {
    console.log(error.message);
  }
};
//forgot validate
const forgotSendtoEmail = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_verified == 0) {
        res.render("forget_password", { message: "Email Not veryfied" });
      } else {
        const randomstrinG = randomstring.generate();

        const Updateddata = await User.updateOne(
          { email: email },
          { $set: { token: randomstrinG } }
        );
        const user = await User.findOne({ email: email });

        resetsendVerifymail("User", user.email, randomstrinG);

        res.render("forget_password", {
          message: "Please check your Mail for Reset your password",
        });
      }
    } else {
      res.render("forget_password", { message: "Wrong Email Id" });
    }
  } catch (error) {
    console.log(error.messages);
  }
};

// reset password load(pass in query)
const resetpassLoad = async (req, res) => {
  try {
    const inputtoken = req.query.token;
    const userData = await User.findOne({ token: inputtoken });
    if (userData) {
      res.render("reset_password", { email: userData.email });
    } else {
      res.render("404", { message: "Invlaid Token" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//reset password verify (post)
const resetpassverify = async (req, res) => {
  try {
    const password = req.body.password;
    const email = req.body.email;

    const spassword = await securePassword(password);

    const updatedData = await User.findOneAndUpdate(
      { email: email },
      { $set: { password: spassword, token: "" } }
    );

    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

//reSEND password timeout(get)
const resend = async (req, res) => {
  try {
    //Generate a random 4-digit OTP
    const otpGenarated = Math.floor(1000 + Math.random() * 9999);
    otp = otpGenarated;

    sendVerifymail(name2, email2, otpGenarated);
    res.render("otpReminder");
  } catch (error) {
    console.log(error.message);
  }
};

//profile page
const loadProfile = async (req, res) => {
  try {
    const userId=req.session.user_id
    const user = await User.findOne({ _id:userId })
    const dataAddress=await AddressDB.findOne({user:userId})
    const order=await orderDB.find({user:userId}).populate('products.product_Id')
    res.render("profile", { user, dataAddress, order });
  } catch (error) {
    console.log(error.message);
  }
};



module.exports = {
  loadHome,
  loadMen,
  loadWomen,
  loadAbout,
  loadContact,
  loadOrderComplete,
  loadWishList,
  loadLogin,
  loadmobileOtp,
  userLogout,
  loadRegister,
  verifyUser,
  verifyLogin,
  loadOtp,
  otpValidation,
  loadProfile,
  forgotLoad,
  forgotSendtoEmail,
  resetpassLoad,
  resetpassverify,
  resend,
  mobileOtp,
  mobileotpVerify
};

const Product = require("../model/productModel");
const Banner = require("../model/bannerModel");
const User = require("../model/userModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const session = require("express-session");
const randomstring = require("randomstring");
const cart = require("../model/cartModel");
const mongoose = require("mongoose");
const AddressDB = require("../model/addressModel");
const categoryDB = require("../model/categoryModel");
const orderDB = require("../model/orderModel");
const twilio = require("twilio");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

dotenv.config();
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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
      from: process.env.EMAIL_USER,
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
const loadHome = async (req, res, next) => {
  try {
    const session = req.session.user_id;
    console.log(session, "homeSession");
    const product = await Product.find({ blocked: false }).populate({
      path: "offer",
      match: {
        startingDate: { $lte: new Date() },
        expiryDate: { $gte: new Date() },
      },
    });
    const banners = await Banner.find({});
    res.render("index", { activePage: "home", product, session, banners });
  } catch (error) {
    next(error);
  }
};

//men page
const loadMen = async (req, res, next) => {
  try {
    const product = await Product.find({ blocked: false,gender:'men'});
    const categories=await categoryDB.find({blocked:false}).limit(3)
    res.render("men", { activePage: "men", product ,categories});
  } catch (error) {
    next(error);
  }
};

//women page
const loadWomen = async (req, res, next) => {
  try {
    const categories = await categoryDB.find({ blocked: false });
    const product = await Product.find({ blocked: false,gender:'women' });
    res.render("women", { activePage: "women", product, categories });
  } catch (error) {
    next(error);
  }
};

//search page
const loadsearch = async (req, res, next) => {
  try {
    const price = req.query.price;
    const searchItem = req.query.searchItem;
    const filterCategory = req.query.category;
    const condition = { blocked: false };

    if (filterCategory) {
      condition.category = filterCategory;
    }
    if (price) {
      // condition.price = price;
      condition.$or = [
        { price: { $gt: price - 1000, $lt: price }}
      ];
    }
    if (searchItem) {
      condition.$or = [
        { name: { $regex: searchItem, $options: "i" } },
        { description: { $regex: searchItem, $options: "i" } },
      ];
    }

    const category = await categoryDB.find({});

    const productCategory = await Product.find({}).populate("category");

    // Filter the populated results based on the category name
    const filteredProducts = productCategory.filter(
      (product) => product.category && product.category.name === filterCategory
    );
    const products = await Product.find(condition)
      .populate({
        path: "offer",
        match: {
          startingDate: { $lte: new Date() },
          expiryDate: { $gte: new Date() },
        },
      })
      .populate("category");

    const intPrice = parseInt(price);

    const priceData = await Product.aggregate([
      { $match: { price: { $gt: intPrice - 1000, $lt: intPrice } } },
      {
        $sort: {
          price: 1,
        },
      },
    ]);
    res.render("search", {
      products,
      searchItem,
      category,
      productCategory,
      priceData,
      filteredProducts,
      price,
      filterCategory,
      condition,
    });
  } catch (error) {
    next(error);
  }
};

//about page
const loadAbout = async (req, res, next) => {
  try {
    res.render("about", { activePage: "about" });
  } catch (error) {
    next(error);
  }
};

//contact page
const loadContact = async (req, res, next) => {
  try {
    res.render("contact", { activePage: "contact" });
  } catch (error) {
    next(error);
  }
};

//wish-list page
const loadWishList = async (req, res, next) => {
  try {
    res.render("add-to-wishlist");
  } catch (error) {
    next(error);
  }
};

// orderComplete page
const loadOrderComplete = async (req, res, next) => {
  try {
    res.render("order-complete");
  } catch (error) {
    next(error);
  }
};

//login page
const loadLogin = async (req, res, next) => {
  try {
    res.render("login");
  } catch (error) {
    next(error);
  }
};

//walletHistoryPage
const loadwalletHistory = async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const user = await User.findOne({ _id: user_id });
    res.render("walletHistory", { wallet: user.walletHistory });
  } catch (error) {
    next(error);
  }
};

//logout button(destory session)
const userLogout = async (req, res, next) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    next(error);
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
    // res.render("men");
    res.redirect("/");
  } catch (err) {
    console.error("Error during sign in:", err);
    res.render("login", { message: "An error occurred during sign in" });
  }
};

// mobileOtp
const mobileOtp = async (req, res, next) => {
  try {
    const inputEmail = req.body.inputEmail;
    const inputPassword = req.body.inputPassword;
    const userData = await User.findOne({
      $or: [{ inputEmail }, { mob: inputEmail }],
    });
    if (!userData) {
      return res.render("login", { message: "Invalid username or password" });
    }

    // Check if the user's account is verified
    if (userData.is_verified == 0) {
      return res.render("login", { message: "Account not verified" });
    }

    const passwordMatch = await bcrypt.compare(
      inputPassword,
      userData.password
    );
    if (!passwordMatch) {
      return res.render("login", { message: "Invalid username or password" });
    }
    const otpMob = Math.floor(1000 + Math.random() * 9999);
    const user = userData._id;
    res.json({ success: true, otpMob, user });
  } catch (error) {
    next(error);
  }
};
// mobileotp(get)
const loadmobileOtp = async (req, res, next) => {
  try {
    const mobOtp = req.query.mobOtp;
    const user = req.query.user;
    const message = `Your OTP is: ${mobOtp}`;
    twilioClient.messages
      .create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: "+918089555859",
      })
      .then((message) => {
        console.log(message.sid);
        res.render("mobileOtp", { mobOtp, user });
        // res.json({ success: true, message: 'OTP sent successfully!' });
      })
      .catch((error) => {
        console.error(error);
        res
          .status(500)
          .json({ success: false, message: "Failed to send OTP." });
      });
  } catch (error) {
    next(error);
  }
};

// mobileotpVerify(post)
const mobileotpVerify = async (req, res, next) => {
  try {
    const mobOtp = req.query.mobOtp;
    const user = req.query.user;
    const inputOtp = req.body.otp;

    if (mobOtp == inputOtp) {
      req.session.user_id = user;
      res.redirect("/");
    } else {
      res.render("mobileOtp", {
        message: "An error occurred during verification",
        mobOtp,
        user,
      });
    }

    // res.render('mobileOtp',{mobOtp})
  } catch (error) {
    next(error);
  }
};

//register pageload
const loadRegister = async (req, res, next) => {
  try {
    res.render("register");
  } catch (error) {
    next(error);
  }
};
//register verify post
const verifyUser = async (req, res, next) => {
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
    next(error);
  }
};

// load OTP
const loadOtp = async (req, res, next) => {
  try {
    res.render("otpReminder");
  } catch (error) {
    next(error);
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
const forgotLoad = async (req, res, next) => {
  try {
    res.render("forget_password");
  } catch (error) {
    next(error);
  }
};
//forgot validate
const forgotSendtoEmail = async (req, res, next) => {
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
    next(error);
  }
};

// reset password load(pass in query)
const resetpassLoad = async (req, res, next) => {
  try {
    const inputtoken = req.query.token;
    const userData = await User.findOne({ token: inputtoken });
    if (userData) {
      res.render("reset_password", { email: userData.email });
    } else {
      res.render("404", { message: "Invlaid Token" });
    }
  } catch (error) {
    next(error);
  }
};

//reset password verify (post)
const resetpassverify = async (req, res, next) => {
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
    next(error);
  }
};

//reSEND password timeout(get)
const resend = async (req, res, next) => {
  try {
    //Generate a random 4-digit OTP
    const otpGenarated = Math.floor(1000 + Math.random() * 9999);
    otp = otpGenarated;

    sendVerifymail(name2, email2, otpGenarated);
    res.render("otpReminder");
  } catch (error) {
    next(error);
  }
};

//profile page
const loadProfile = async (req, res, next) => {
  try {
    const url = req.url;
    const userId = req.session.user_id;
    const user = await User.findOne({ _id: userId });
    const dataAddress = await AddressDB.findOne({ user: userId });
    const order = await orderDB
      .find({ user: userId })
      .populate("products.product_Id");
    res.render("profile", { user, dataAddress, order, url });
  } catch (error) {
    next(error);
  }
};

const invoiceDownload = async (req, res) => {
  try {
    const { orderId } = req.query;
    const userId = req.session.user_id;
    let sumTotal = 0;
    const userData = await User.findById(userId);
    const orderData = await orderDB
      .findById(orderId)
      .populate("products.product_Id");

    orderData.products.forEach((item) => {
      const total = item.product_Id.price * item.quantity;
      sumTotal += total;
    });

    const date = new Date();
    const data = {
      order: orderData,
      user: userData,
      date,
      sumTotal,
    };

    const filepathName = path.resolve(__dirname, "../views/user/invoice.ejs");
    const html = fs.readFileSync(filepathName).toString();
    const ejsData = ejs.render(html, data);
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(ejsData, { waitUntil: "networkidle0" });
    const pdfBytes = await page.pdf({ format: "Letter" });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename= orderInvoice_showClub.pdf"
    );
    res.send(pdfBytes);
  } catch (error) {
    next(error);
  }
};

const review = async (req, res, next) => {
  try {
    const id = req.body.id;
    const { review, rating } = req.body;
    const newReview = {
      user: req.session.user_id,
      review: review,
      rating: rating,
    };
    await Product.findOneAndUpdate(
      { _id: id },
      { $push: { review: newReview } }
    );

    res.redirect(`/product-detail?productid=${id}`);
  } catch (error) {
    next(error);
  }
};


const verifyContact = async (req, res, next) => {
  try {
    const { fname, lname, email, subject, message }= req.body;

    // Form data is valid, send the email
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

    

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to:process.env.EMAIL_USER,
      subject: 'New Contact Form Submission',
      text: `Name: ${fname} ${lname}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send('An error occurred while sending the email.');
      } else {
        console.log('Email sent:', info.response);
        res.send('Form submitted and email sent successfully.');
      }
    });
  } catch (error) {
    next(error);
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
  loadRegister,
  loadProfile,
  loadOtp,
  loadsearch,
  loadwalletHistory,
  userLogout,
  verifyUser,
  verifyLogin,
  otpValidation,
  forgotLoad,
  forgotSendtoEmail,
  resetpassLoad,
  resetpassverify,
  resend,
  mobileOtp,
  mobileotpVerify,
  invoiceDownload,
  review,
  verifyContact,
};

const Product = require("../model/productModel");
const User = require("../model/userModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const session = require("express-session");
const randomstring = require("randomstring");
const cart = require("../model/cartModel");
const mongoose =require('mongoose')

dotenv.config();

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

//cart page
const loadCart = async (req, res) => {
  try {
   const  userId=req.session.user_id
    const cartDB=await cart.find({user:userId})//.populate("Products.productId");
    console.log(cartDB);
    res.render("cart", { activePage: "cart" });
  } catch (error) {
    console.log(error.message);
  }
};

//checkOut page
const loadCheckOut = async (req, res) => {
  try {
    res.render("checkout");
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
    console.log(req.session.user_id, ":session is created");
    res.render("men");
  } catch (err) {
    console.error("Error during sign in:", err);
    res.render("login", { message: "An error occurred during sign in" });
  }
};

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
    const user = await User.findOne({ _id: req.session.user_id });
    res.render("profile", { user, dataAddress: null, order: null });
  } catch (error) {
    console.log(error.message);
  }
};

const addtoCart = async (req, res) => {
  try {
    
    // console.log('start working addtocart');
    // const { user_id } = req.session;
    // const { product_Id} = req.body;
    // const userCart = await cart.findOne({ userId: user_id });
    // const findPrice = await Product.findOne({ _id: product_Id });
    // const total = product_quantity * findPrice.price;
    // if (userCart) {
    //   const findProduct = await cart.findOne({
    //     userId: user_id,
    //     "items.product_Id": new mongoose.Types.ObjectId(product_Id),
    //   });
    //   if (findProduct) {
    //     await cart.findOneAndUpdate(
    //       {
    //         userId: user_id,
    //         "items.product_Id": new mongoose.Types.ObjectId(product_Id),
    //       },
    //       {
    //         $inc: {
    //           "items.$.quantity": product_quantity,
    //           "items.$.total": total,
    //           grandTotal: total,
    //         },
    //       },
    //       { new: true }
    //     );
    //   } else {
    //     await cart.updateOne(
    //       { userId: user_id },
    //       {
    //         $push: {
    //           items: {
    //             product_Id: new mongoose.Types.ObjectId(product_Id),
    //             quantity: product_quantity,
    //             total: total,
    //           },
    //         },
    //         $inc: { count: 1, grandTotal: total },
    //       }
    //     );
    //   }
    // } else {
    //   const makeCart = new cart({
    //     userId: user_id,
    //     items: [
    //       {
    //         product_Id: new mongoose.Types.ObjectId(product_Id),
    //         quantity: product_quantity,
    //         count: 1,
    //         total: total,
    //       },
    //     ],
    //     grandTotal: total,
    //   });
    //   await makeCart.save();
    // }
    // const cart = await cart.findOne({ userId: user_id });
    // res.json({ count: cart.items.length });



    console.log('working addcart');
    const cartdb = await cart.findOne({});
    console.log(cartdb,'sajid');
    
    const productId = req.body.product_Id;
    console.log(productId, "this is product addto cart", req.session.user_id);

    const UserId = await User.findOne({ _id: req.session.user_id });

    //database checking
    const productData = await Product.findById(productId);
    const Usercart = await cart.findOne({ userId: UserId });

    if (Usercart) {
      //checking cart prodcut avaliable
      const productavaliable = await Usercart.product.findIndex(
        (product) => product.product_Id == productId
      );
      if (productavaliable != -1) {
        console.log(productavaliable,'pro working');
        //if have product in cart the qnty increse
        await cart.findOneAndUpdate(
          { userId: UserId, "product.product_Id": productId },
          { $inc: { "product.$.quantity": 1 } }
        );
        res.json({ success: true });
        
      } else {
        //if no product in cart add product
        await cart.findOneAndUpdate(
          { userId: UserId },
          {
            $push: {
              product: { product_Id: productId, price: productData.price },
            },
          }
        );
        res.json({ success: true })
        
      }
    } else {
      const CartData = new cart({
        userId: UserId._id,
        product: [
          {
            product_Id: productId,
            price: productData.price,
          },
        ],
      });
      const cartData = await CartData.save();
      if (cartData) {
        
        res.json({ success: true });
      } else {
        res.json("/");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// abd jun
// const AddCart = async (req, res) => {
//   try {
//       const userid = req.session.user_id
//       const quantity = req.body.product_quantity
//       const product_Id = req.body.product_Id
//       const cartdata = await cart.findOne({ userId: userid })
//       const productData = await Product.findOne({ _id: product_Id })
//       const total = quantity * productData.price

  


//       if (cartdata) {
//           const findProduct = await cart.findOne({
//               userId: userid,
//               "items.product_Id": new mongoose.Types.ObjectId(product_Id),
//           });
//           if (findProduct) {
//               const cartProduct = cartdata.items.find(
//                   (product) => product.product_Id.toString() === product_Id
//               );
//               if (cartProduct.quantity < productData.stock) {
//                   await cart.findOneAndUpdate({
//                       userId: userid,
//                       'items.product_Id': new mongoose.Types.ObjectId(product_Id)
//                   }, {
//                       $inc: {
//                           'items.$.quantity': quantity,
//                           'items.$.total': total,
//                           grandTotal: total
//                       }
//                   }
//                   )
//               }
//           } else {
//               await cart.updateOne(
//                   { userId: userid },
//                   {
//                       $push: {
//                           items: {
//                               product_Id: new mongoose.Types.ObjectId(product_Id),
//                               quantity: quantity,
//                               total: total,
//                               price: productData.price
//                           },
//                       },
//                       $inc: { count: 1, grandTotal: total },
//                   }
//               );
//           }
//       }
//        else {
//            const NewCart = new cart({
//               userId: userid,
//              items: [{
//                   product_Id: new mongoose.Types.ObjectId(product_Id),
//                   quantity: quantity,
//                   total: total,
//                   price: productData.price
//               }],
//               grandTotal: total,
//               count: 1
//           })
  
//           const data = await NewCart.save()
  
//       }
//       }
//        catch (err) {
//   console.log(err.message);
// }
// }

module.exports = {
  loadHome,
  loadMen,
  loadWomen,
  loadAbout,
  loadCart,
  loadCheckOut,
  loadContact,
  loadOrderComplete,
  loadWishList,
  loadLogin,
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
  addtoCart,
};

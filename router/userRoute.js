
const express = require("express");
const user_Route = express();
const auth=require('../middleware/userAuth')

//controllers
const userController = require('../controllers/userController')
const productController = require('../controllers/productController') 
const cartController = require('../controllers/cartController') 

user_Route.set("views", "./views/user");

//load pages
user_Route.get("/",userController.loadHome);
user_Route.get("/men",userController.loadMen);
user_Route.get("/women",userController.loadWomen);
user_Route.get("/about",userController.loadAbout);
user_Route.get("/contact",userController.loadContact);
user_Route.get("/add-to-wishlist",auth.isLogin,userController.loadWishList);
user_Route.get("/checkout",auth.isLogin,userController.loadCheckOut);
user_Route.get("/order-complete",auth.isLogin,userController.loadOrderComplete);
user_Route.get("/product-detail",productController.loadProductDetail);

//login
user_Route.get("/login",auth.isLogout,userController.loadLogin);
user_Route.post("/login",userController.verifyLogin)

//logout
user_Route.get("/logout",userController.userLogout)

//register/signup
user_Route.get("/register",auth.isLogout,userController.loadRegister);
user_Route.post("/register",userController.verifyUser)

//otp
user_Route.get("/otp",auth.isLogin,userController.loadOtp)
user_Route.post("/otp",userController.otpValidation)

//forgot password
user_Route.get('/forgot',auth.isLogout,userController.forgotLoad)
user_Route.post('/forgot',userController.forgotSendtoEmail)

//reset password
user_Route.get('/reset_password',userController.resetpassLoad)
user_Route.post('/reset_password',userController.resetpassverify)

//resend password
user_Route.get('/resend',auth.isLogin,userController.resend)

//profile
user_Route.get("/profile",auth.isLogin,userController.loadProfile)


//cart
user_Route.get("/cart",cartController.loadCart);//auth.isLogin,
// user_Route.post("/add_to_cart",auth.isLogin,userController.addtoCart)
user_Route.post('/cart',cartController.addtoCart)





module.exports = user_Route;

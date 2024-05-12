
const express = require("express");
const user_Route = express();
const auth=require('../middleware/userAuth')
const errorHandler =require('../middleware/errorHandler')

//controllers
const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')
const productController = require('../controllers/productController') 
const cartController = require('../controllers/cartController') 
const addressController = require('../controllers/addressController') 
const orderController = require('../controllers/orderController') 
const couponController = require('../controllers/couponController') 

user_Route.set("views", "./views/user");

//load page
user_Route.get("/",userController.loadHome);
user_Route.get("/men",userController.loadMen);
user_Route.get("/women",userController.loadWomen);
user_Route.get("/about",userController.loadAbout);
user_Route.get("/contact",userController.loadContact);
user_Route.post("/contact",userController.verifyContact);

user_Route.get("/add-to-wishlist",auth.isLogin,userController.loadWishList);

user_Route.get("/order-complete",auth.isLogin,userController.loadOrderComplete);
user_Route.get("/product-detail",productController.loadProductDetail);

//login
user_Route.get("/login",auth.isLogout,userController.loadLogin);
user_Route.post("/login",userController.verifyLogin);
user_Route.post("/mobileOtp",userController.mobileOtp)
user_Route.get("/mobileOtp",userController.loadmobileOtp)
user_Route.post("/mobileotpVerify",userController.mobileotpVerify);


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

//reset passwords
user_Route.get('/reset_password',userController.resetpassLoad)
user_Route.post('/reset_password',userController.resetpassverify)

//resend password
user_Route.get('/resend',auth.isLogin,userController.resend)

//profile
user_Route.get("/profile",auth.isLogin,userController.loadProfile)
user_Route.get("/orderDetails",orderController.loadOrderDetails)
user_Route.post("/OrderCancel",adminController.OrderCancel)

//cart
user_Route.get("/cart",auth.isLogin,cartController.loadCart);//auth.isLogin,
user_Route.post('/cart',cartController.addtoCart)
user_Route.get('/delete_cartitem',cartController.deletecartitem)
user_Route.post('/changes',cartController.changes)


//adderess
user_Route.get("/checkout",auth.isLogin,cartController.loadCheckOut);//auth.isLogin,
user_Route.post('/checkout',addressController.addAddress)

user_Route.post('/addAddress',addressController.addAddress)

user_Route.get('/addAddress',auth.isLogin,addressController.loadAddAddress)//in profile section
user_Route.get('/editAddress',auth.isLogin,addressController.loadeditAddress)//in profile section

user_Route.get('/remove_address',addressController.remove_address)
user_Route.post('/addAddressPage',addressController.addAddressPage)//in profile section


user_Route.get('/addnewAddress',auth.isLogin,addressController.loadnewAddress)//in profile section
user_Route.post('/addnewAddress',addressController.addnewAddress)//in profile section


// order
user_Route.post('/orderPlace',orderController.proceed)
user_Route.get('/order_Placed',auth.isLogin,orderController.loadOrderPlaced)

user_Route.post('/orderEpay',orderController.orderEpay)
user_Route.get('/test',orderController.test)

//search
user_Route.get('/search',userController.loadsearch)

user_Route.post("/applyCoupon",couponController.applyCoupon);

// wallet
user_Route.get('/walletHistory',userController.loadwalletHistory)

user_Route.get('/invoice',userController.invoiceDownload)

user_Route.post('/review',auth.isLogin,userController.review)

// error handler 
user_Route.use(errorHandler); 

module.exports = user_Route;

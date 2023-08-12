const express = require("express");
const admin_Route = express()
const adminController = require('../controllers/adminController')
const productController = require('../controllers/productController')
const auth=require('../middleware/adminAuth')
const upload = require('../middleware/uploadImage')//multer middleware

admin_Route.set("views","./views/admin");


//LOGIN PAGE
admin_Route.get("/",auth.isLogout,adminController.loadLogin);
admin_Route.post("/",adminController.adminLoginVerify);

// LOG OUT
admin_Route.get("/logout",auth.isLogin,adminController.adminLogout)

//HOME PAGE(DASH BORD)
admin_Route.get("/dashboard",auth.isLogin,adminController.loadHome);

//USER PAGE
admin_Route.get("/userDetails",auth.isLogin,adminController.loadUser);
admin_Route.get("/block-user",auth.isLogin,adminController.blockUser);
admin_Route.get("/unblock-user",auth.isLogin,adminController.unblockUser);

//CATEGORY PAGE
admin_Route.get("/category",auth.isLogin,adminController.loadCategory);
admin_Route.get("/addCategory",auth.isLogin,adminController.loadaddCategory);
admin_Route.post("/addCategory",auth.isLogin,adminController.insertCategory);
admin_Route.get("/editCategory",auth.isLogin,adminController.loadeditCategory);
admin_Route.post("/editCategory",auth.isLogin,adminController.editCategory);

admin_Route.get("/Orders",adminController.loadOrder);
admin_Route.post("/OrderCancel",adminController.OrderCancel);




//PRODUCT PAGE
admin_Route.get("/productlist",auth.isLogin,productController.loadproductList);
admin_Route.get("/addProduct",auth.isLogin,productController.loadaddProduct);
admin_Route.post("/addProduct",upload.array('ProductImage',5),productController.verifyaddProduct);
admin_Route.get("/editProduct",auth.isLogin,productController.loadeditProduct);
admin_Route.post("/editProduct",auth.isLogin,upload.array('Image',5),productController.editProduct);
admin_Route.get("/blockProduct",auth.isLogin,productController.blockProduct);
admin_Route.get("/unblockProduct",auth.isLogin,productController.unblockProduct);
admin_Route.post("/deleteImage",productController.deleteImage);










module.exports = admin_Route;

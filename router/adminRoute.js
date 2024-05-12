const express = require("express");
const admin_Route = express()
const adminController = require('../controllers/adminController')
const productController = require('../controllers/productController')
const bannerController = require('../controllers/bannerController')
const offerController = require('../controllers/offerController')
const auth=require('../middleware/adminAuth')
const upload = require('../middleware/uploadImage')//multer middleware
const errorHandler =require('../middleware/errorHandler')

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
admin_Route.patch('/OrderUpdate',adminController.UpdateOrderStatus)




//PRODUCT PAGE
admin_Route.get("/productlist",auth.isLogin,productController.loadproductList);
admin_Route.get("/addProduct",auth.isLogin,productController.loadaddProduct);
admin_Route.post("/addProduct",upload.array('ProductImage',5),productController.verifyaddProduct);
admin_Route.get("/editProduct",auth.isLogin,productController.loadeditProduct);
admin_Route.post("/editProduct",auth.isLogin,upload.array('Image',5),productController.editProduct);
admin_Route.get("/blockProduct",auth.isLogin,productController.blockProduct);
admin_Route.get("/unblockProduct",auth.isLogin,productController.unblockProduct);
admin_Route.post("/deleteImage",productController.deleteImage);



//COUPON PAGE
admin_Route.get("/coupon",adminController.loadCoupon);
admin_Route.get("/addCoupon",adminController.loadaddCoupon);
admin_Route.post("/addCoupon",adminController.addCoupon);

admin_Route.get("/editCoupon",adminController.loadeditCoupon);
admin_Route.post("/editCoupon",adminController.verifyeditCoupon);



//BANNER

admin_Route.get('/banner' , auth.isLogin , bannerController.loadBanner)
admin_Route.get('/add-banner' , auth.isLogin , bannerController.loadAddBanner)
admin_Route.post('/add-banner' , upload.single('image'), bannerController.addBanner)
admin_Route.get('/edit-banner' , auth.isLogin , bannerController.loadEditBanner)
admin_Route.post('/edit-banner' , auth.isLogin ,upload.single('image'), bannerController.editBanner)
admin_Route.get('/delete' , auth.isLogin , bannerController.deleteBanner)
admin_Route.post('/delete' , auth.isLogin , bannerController.deleteBanner)

//offers

admin_Route.get( '/offers', offerController.getOffer )
admin_Route.get( '/add-offer', offerController.getAddOffer )
admin_Route.post( '/add-offer', offerController.addOffer )

admin_Route.patch( '/apply-product-offer',productController.applyProductOffer )
admin_Route.patch('/remove-product-offer',productController.removeProductOffer)


//sales report

admin_Route.get( '/salesReport', adminController.salesReport )

//To sort the sales report page 
admin_Route.post('/salesReport' ,adminController.sortSalesReport)





// error handler 
admin_Route.use(errorHandler); 


module.exports = admin_Route;

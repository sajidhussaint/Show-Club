const ProductDB = require("../model/productModel");
const UserDB = require("../model/userModel");
const CategoryDB = require("../model/categoryModel");
const cartDB = require("../model/cartModel");
const offerDB = require("../model/offerModel");

const sharp = require('sharp');
const path= require('path');

//``````````````````````````ADMIN``````````````````````````````//

// LOAD  PRODUCT LIST(ADMIN)
const loadproductList = async (req, res,next) => {
  try { 
    
    const product = await ProductDB.find({}).populate('category')
    const availableOffers = await offerDB.find({ status : true, expiryDate : { $gte : new Date() }})
    res.render("productList", { product ,availableOffers});
  } catch (error) {
    console.log(error.message);
  // next(error)
  }
};
// LOAD ADD PRODUCT(ADMIN)
const loadaddProduct = async (req, res) => {
  try {
    const category = await CategoryDB.find({});
    res.render("addProduct", { message: " ", category });
  } catch (error) {
    console.log(error.message);
  }
};
// LOAD EDIT PRODUCT(ADMIN)
const loadeditProduct = async (req, res) => {
  try {
    const id = req.query.product;
    const product = await ProductDB.findOne({ _id: id });
    const category = await CategoryDB.find({});
    res.render("editProduct", { product, category });
  } catch (error) {
    console.log(error.message);
  }
};
//VERIFY ADD PRODUCT(POST)(ADMIN)
const verifyaddProduct = async (req, res) => {
  try {
   
    var arrimage = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const filePath = path.join(
          __dirname,
          "../public/admin/cropped",
          req.files[i].filename
        );
        await sharp(req.files[i].path)
          .resize({ width: 250, height: 250 })
          .toFile(filePath);
        arrimage.push(req.files[i].filename);

        //  imageArr.push(req.files[i].filename);
      }
    }

    const { name, category, price, quantity, description } = req.body;

    if (price && quantity > 0) {
      const existProduct = await ProductDB.findOne({ name: name });

      if (existProduct) {
        res.render("addProduct", { message: "product exists" });
      } else {
        const productData = new ProductDB({
          name: name,
          category: category,
          price: price,
          quantity: quantity,
          description: description,
          image: arrimage,
        });

        const newProduct = productData.save();

        if (newProduct) {
          res.redirect("/admin/productlist");
        } else {
          res.render("addProduct", { message: "something went wrong" });
        }
      }
    } else {
      res.render("addProduct", { message: "cannot give a negative value" }); //, categories: category
    }
  } catch (error) {
    console.log(error.message);
  }
};

// LOAD EDIT PRODUCT(ADMIN)
const blockProduct = async (req, res) => {
  try {
    const product = req.query.product;
    await ProductDB.updateOne({ _id: product }, { $set: { blocked: true } });
    res.redirect("/admin/productlist");
  } catch (error) {
    console.log(error.message);
  }
};

const unblockProduct = async (req, res) => {
  try {
    const product = req.query.product;
    await ProductDB.updateOne({ _id: product }, { $set: { blocked: false } });
    res.redirect("/admin/productlist");
  } catch (error) {
    console.log(error.message);
  }
};

//EDIT CATEGORY LOAD(POST)
const editProduct = async (req, res) => {
  try {
    const qid = req.query.id;

    const { name, category, price, quantity, description } = req.body;

    var imageArr = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const filePath = path.join(
          __dirname,
          "../public/admin/cropped",
          req.files[i].filename
        );
        await sharp(req.files[i].path)
          .resize({ width: 250, height: 250 })
          .toFile(filePath);
        imageArr.push(req.files[i].filename);

        //  imageArr.push(req.files[i].filename);
      }
    }
    console.log(imageArr);

    if (req.files && req.files.length > 0) {
      await ProductDB.updateOne(
        { _id: qid },
        {
          $set: {
            name: name,
            description: description,
            quantity: quantity,
            price: price,
            category: category,
            image: imageArr,
          },
        }
      );
      res.redirect("/admin/productlist");
    } else {
      await ProductDB.updateOne(
        { _id: qid },
        {
          $set: {
            name: name,
            description: description,
            quantity: quantity,
            price: price,
            category: category,
          },
        }
      );
      res.redirect("/admin/productlist");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//DELETE IMAGE PRODUCT EDIT
const deleteImage = async (req, res) => {
  try {
    const id = req.body.productId;
    const image = req.body.image;

    const productDeleted = await ProductDB.findOneAndUpdate(
      {_id:id },
      { $pull: { image: image } }
    );

    res.json({ success: true });

  } catch (error) {
    console.log(error.message);
  }
};

//``````````````````````````ADMIN``````````````````````````````//

// productDetail page
const loadProductDetail = async (req, res) => {
  try {
    const id = req.query.productid;
    const product = await ProductDB.findById({ _id: id }).populate({
      path : 'offer',
      match :  { startingDate : { $lte : new Date() }, expiryDate : { $gte : new Date() }}
  })
    if (req.session.user_id) {
      const carts = await cartDB.findOne({ userId: req.session.user_id });
      if (carts) {
        var productavaliable = await carts.product.findIndex(
          (product) => product.product_Id == id
        );
      } else {
        var productavaliable = -1;
      }
    }

    res.render("product-detail", { product, productavaliable });
  } catch (error) {
    console.log(error.message);
  }
};

const applyProductOffer= async(req,res,next)=>{
  try { 
    console.log('working apply product');
    const { offerId, productId } = req.body
            await ProductDB.updateOne({ _id : productId },{
                $set : {
                    offer : offerId
                }
            })
            res.json({ success : true})
    
  } catch (error) {
    next(error)
  }
}

const removeProductOffer=async(req,res)=>{
  try {
    const { productId } = req.body
            const remove = await ProductDB.updateOne({ _id : productId },{
                $unset : {
                    offer : ""
                }
            })
            res.json({ success : true })
      
  } catch (error) {
       next(error)
  }
}

module.exports = {
  loadproductList,
  loadaddProduct,
  loadeditProduct,
  verifyaddProduct,
  editProduct,
  blockProduct,
  unblockProduct,
  loadProductDetail,
  deleteImage,
  applyProductOffer,
  removeProductOffer
};

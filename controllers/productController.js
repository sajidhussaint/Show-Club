const ProductDB = require("../model/productModel");
const UserDB = require("../model/userModel");
const CategoryDB = require("../model/categoryModel");
const cartDB = require("../model/cartModel");

// LOAD  PRODUCT LIST(ADMIN)
const loadproductList = async (req, res) => {
  try {
    
    const product = await ProductDB.find({});
    res.render("productList", { product });
  } catch (error) {
    console.log(error.message);
  }
};
// LOAD ADD PRODUCT(ADMIN)
const loadaddProduct = async (req, res) => {
  try {
    const category=await CategoryDB.find({})
    res.render("addProduct", { message: " ",category });
  } catch (error) {
    console.log(error.message);
  }
};
// LOAD EDIT PRODUCT(ADMIN)
const loadeditProduct = async (req, res) => {
  try {
    const id=req.query.product;
    const product = await ProductDB.findOne({_id:id});
    const category=await CategoryDB.find({})
    res.render("editProduct",{product,category});
  } catch (error) {
    console.log(error.message);
  }
};
//VERIFY ADD PRODUCT(POST)(ADMIN)
const verifyaddProduct = async (req, res) => {
  try {
    const { name, category, price, quantity, description } = req.body;

    const productData = new ProductDB({
      name: name,
      category: category,
      price: price,
      quantity: quantity,
      description: description,
    });

    const addproductdata = await productData.save();
    if (addproductdata) {
      res.redirect("/admin/productList");
    } else {
      res.render("addProduct", { message: "something wrong!!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// LOAD EDIT PRODUCT(ADMIN)
const blockProduct = async (req, res) => {
  try {
    const product = req.query.product;
    await ProductDB.updateOne({_id: product}, {$set:{blocked:true}});
    res.redirect("/admin/productlist");
  } catch (error) {
    console.log(error.message);
  }
};

const unblockProduct = async (req, res) => {
  try {
    const product = req.query.product;
    await ProductDB.updateOne({_id: product}, {$set:{blocked:false}});
    res.redirect("/admin/productlist");
  } catch (error) {
    console.log(error.message);
  }
};

// productDetail page
const loadProductDetail = async (req, res) => {
  try {
    const id = req.query.productid;
    const product = await ProductDB.findById({_id:id})
    if(req.session.user_id){
      const carts=await cartDB.findOne({userId:req.session.user_id})
      if(carts){

        console.log(carts,'this is carts');
        var productavaliable = await carts.product.findIndex(
          (product) => product.product_Id == id
        );
      }else{
        var productavaliable=-1
      }
    }
   
    res.render("product-detail", { product ,productavaliable});
  } catch (error) {
    console.log(error.message);
  }
};

//EDIT CATEGORY LOAD(POST)
const editProduct = async (req, res) => {
  try {
    const qid=req.query.id

    const { name,category,price,quantity, description } = req.body;

    await ProductDB.updateOne({_id:qid},{ $set: { name:name,description:description,quantity:quantity,price:price,category:category} })
    res.redirect("/admin/productlist");
    
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadproductList,
  loadaddProduct,
  loadeditProduct,
  verifyaddProduct,
  editProduct,
  blockProduct,
  unblockProduct,
  loadProductDetail,
};

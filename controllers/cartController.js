const cart = require("../model/cartModel");
const Product = require("../model/productModel");
const User = require("../model/userModel");
const AddressDB = require("../model/addressModel");
const orderDB = require("../model/addressModel");
const mongoose = require("mongoose");
 







const loadCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const products = await cart
      .findOne({ userId: userId })
      .populate("product.product_Id");
    res.render("cart", { activePage: "cart", products });
  } catch (error) {
    console.log(error.message);
  }
};


//checkOut page
const loadCheckOut = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const address = await AddressDB.findOne({ user: userId });
    const cartproduct=await cart.findOne({userId: userId})
    const order = await orderDB.findOne({ user: userId})
    .sort({ _id: -1 })
  
    res.render("checkout",{address,cartproduct,order});
  } catch (error) {
    console.log(error.message);
  }
};

  
// abd jun
const addtoCart = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const quantity = req.body.product_quantity;
    const product_Id = req.body.product_Id;
    const cartdata = await cart.findOne({ userId: userid });
    const productData = await Product.findOne({ _id: product_Id });
    const total = quantity * productData.price;

    if (cartdata) {
      const findProduct = await cart.findOne({
        userId: userid,
        "product.product_Id": new mongoose.Types.ObjectId(product_Id),
      });
      if (findProduct) {
        const cartProduct = cartdata.product.find(
          (product) => product.product_Id.toString() === product_Id
        );
        if (cartProduct.quantity < productData.quantity) {
          await cart.findOneAndUpdate(
            {
              userId: userid,
              "product.product_Id": new mongoose.Types.ObjectId(product_Id),
            },
            {
              $inc: {
                "product.$.quantity": quantity,
                "product.$.total": total,
                grandTotal: total,
              },
            }
          );
        }
      } else {
        await cart.updateOne(
          { userId: userid },
          {
            $push: {
              product: {
                product_Id: new mongoose.Types.ObjectId(product_Id),
                quantity: quantity,
                total: total,
                price: productData.price,
              },
            },
            $inc: { count: 1, grandTotal: total },
          }
        );
      }
    } else {
      const NewCart = new cart({
        userId: userid,
        product: [
          {
            product_Id: new mongoose.Types.ObjectId(product_Id),
            quantity: quantity,
            total: total,
            price: productData.price,
          },
        ],
        grandTotal: total,
        count: 1,
      });

      const data = await NewCart.save();
    }
  } catch (err) {
    console.log(err.message);
  }
};

//delete cart item
const deletecartitem = async (req, res) => {
  try {
    const id = req.query.id;
    const userid = req.session.user_id;
    const productCart = await cart.findOne(
      { userId: userid, "product.product_Id": id },
      { userId: 1, product: { $elemMatch: { product_Id: id } } }
    );
    const total = productCart.product[0].total;
    await cart.findOneAndUpdate(
      { userId: userid },
      {
        $pull: { product: { product_Id: id } }, // Remove the product from the product array
        $inc: { grandTotal: -total ,count: -'1' } // Decrement the grandTotal by 
    }
    );
    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};

//increse decres change
const changes = async (req, res) => {
  try {
    const count = req.body.count;
    const productId = req.body.productId;

    const Cart = await cart.findOne({ userId: req.session.user_id });
    const product = await Product.findOne({ _id: productId });

    const cartProduct = Cart.product.find(
      (product) => product.product_Id.toString() === productId
    );

    if (count == 1) {
      if (cartProduct.quantity < product.quantity) {
        const incqt = await cart.findOneAndUpdate(
          { userId: req.session.user_id, "product.product_Id": productId },
          {
            $inc: {
              "product.$.quantity": 1,
              "product.$.total": product.price,
              grandTotal: product.price,
            },
          }
        );

        res.json({ success: true });
      } else {
        res.json({
          success: false,
          message: `The maximum quantity available for this product is ${product.quantity} . Please adjust your quantity.`,
        });
      }
    } else if (count == -1) {
      if (cartProduct.quantity > 1) {
        await cart.updateOne(
          { userId: req.session.user_id, "product.product_Id": productId },
          {
            $inc: {
              "product.$.quantity": -1,
              "product.$.total": -product.price,
              grandTotal: -product.price,
            },
          }
        );

        res.json({ success: true });
      } else {
        res.json({
          success: false,
          message: "Cannot decrement the quantity anymore",
        });
  
      }
    } else {
      res.json({ success: false, message: "Invalid count value" });
    }
  } catch (err) {
    console.log(err.message);
  }
};


const loadProceed = async (req, res) => {
  try {
      const userid = req.session.userid;
      const products = await cart.findOne({ userId: userid }).populate(
          "items.product_Id"
      );
      const dataAddress = await AddressDB.findOne({ user: userid })

      res.render('Proceed', { products, dataAddress })

  } catch (err) {
      console.log(err.message);
  }
}
module.exports = { addtoCart, loadCart, deletecartitem, changes,loadCheckOut ,loadProceed};

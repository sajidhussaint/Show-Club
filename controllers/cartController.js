const cart = require("../model/cartModel");
const Product = require("../model/productModel");
const User = require("../model/userModel");


const loadCart = async (req, res) => {
    try {
     const  userId=req.session.user_id
      const products=await cart.find({userId:userId}).populate("product.product_Id");
      console.log(products,'this is cart db load cart');
      res.render("cart", { activePage: "cart" ,products});
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


    const productId = req.body.product_Id;

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
        res.json({ success: true });
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




module.exports = { addtoCart ,loadCart};

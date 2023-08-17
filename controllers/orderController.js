const cartDB = require("../model/cartModel");
const ProductDB = require("../model/productModel");
const UserDB = require("../model/userModel");
const AddressDB = require("../model/addressModel");
const orderDB = require("../model/orderModel");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const couponHelper = require("../helpers/couponHelper");

dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const test = async (req, res,next) => {
  try {
    const datas = await orderDB.find({});

    res.json(datas[1].products[0].total);
  } catch (error) {
    next(error)
  }
};

const loadOrderDetails = async (req, res,next) => {
  try {
    const orderId = req.query.orderId;
    const order = await orderDB
      .findOne({ _id: orderId })
      .populate("products.product_Id");

    res.render("orderDetails", { order });
  } catch (error) {
    next(error)
  }
};

const proceed = async (req, res,next) => {
  try {
    const userid = req.session.user_id;
    const address = req.body.address;
    const payment = req.body.payment;
    var grandTotal = req.body.total;

    const user = await UserDB.findOne({ _id: userid });
    const cartData = await cartDB.findOne({ userId: userid });
    const cartProducts = cartData.product;

    let status = payment == "cod" ? "placed" : "pending";
    const orderDate = new Date();
    const delivery = new Date(orderDate.getTime() + 10 * 24 * 60 * 60 * 1000);
    const deliveryDate = delivery
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    let orderTotalPromise;
    if (cartData.coupon) {
      const cartCoupon = cartData.coupon.toString();
      console.log('runn disc total');
      orderTotalPromise = couponHelper.discountPrice(cartCoupon, grandTotal)
        .then(discounted => discounted.discountedTotal);
    } else {
      console.log('runn garnd total');
      orderTotalPromise = Promise.resolve(grandTotal);
    }

    const orderTotal = await orderTotalPromise;

    const order = new orderDB({
      user: userid,
      deliveryAddress: address,
      userName: user.name,
      totalAmount: orderTotal,
      status: status,
      date: orderDate,
      payment: payment,
      products: cartProducts,
      expectedDelivery: deliveryDate,
    });

    const orderData = await order.save();

    if (orderData.payment != "razorpay") {
      const productUpdatePromises = cartProducts.map(async (cartProduct) => {
        await ProductDB.findByIdAndUpdate(
          { _id: cartProduct.product_Id },
          {
            $inc: {
              quantity: -cartProduct.quantity,
            },
          }
        );
      });

      await Promise.all(productUpdatePromises);
      await cartDB.findOneAndDelete({ userId: userid });
    }
    res.json({ success: true });
  } catch (error) {
    next(error)
  }
};


const loadOrderPlaced = async (req, res,next) => {
  try {
    const id = req.session.user_id;
    const cartData = await cartDB.findOne({ userId: req.session.user_id });
    const order = await orderDB
      .findOne({ user: id })
      .sort({ _id: -1 })
      .populate("products.product_Id");

    if (order.payment == "razorpay") {
      const cartProducts = cartData.product;
      const orderStatusUpdatePromise = orderDB.findOneAndUpdate(
        { user: id },
        { $set: { status: "placed" } },
        { sort: { _id: -1 } }
      );

      const updateProductQuantitiesPromises = cartProducts.map(async (cartProduct) => {
        await ProductDB.findByIdAndUpdate(
          { _id: cartProduct.product_Id },
          {
            $inc: {
              quantity: -cartProduct.quantity,
            },
          }
        );
      });

      await Promise.all([orderStatusUpdatePromise, ...updateProductQuantitiesPromises]);

      await cartDB.findOneAndDelete({ userId: req.session.user_id });
    }

    console.log(order.status, "this is order status");

    res.render("orderPLaced", { order });
  } catch (error) {
    next(error)
  }
};

const orderEpay = async (req, res,next) => {
  try {
    const cartData = await cartDB.findOne({ userId: req.session.user_id });
    const cartCoupon = cartData.coupon;
    const discounted = await couponHelper.discountPrice(
      cartCoupon,
      req.body.total
    );
    if (cartCoupon) {
      var amount = discounted.discountedTotal * 100;
    } else {
      console.log('this is working total*100');
      var amount = req.body.total * 100;
    }
    const mobile = req.body.mobile;
    const email = req.body.email;
    const options = {
      amount: amount,
      currency: "INR",
      receipt: process.env.EMAIL_USER,
    };
    razorpayInstance.orders.create(options, (err, order) => {
      if (!err) {
        res.status(200).send({
          success: true,
          msg: "order created",
          order_id: order.id,
          amount: amount,
          key_id: process.env.RAZORPAY_ID_KEY,
          product_name: "nike",
          description: "nice",
          contact: mobile,
          name: "sajid",
          email: email,
        });
      } else {
        res.status(400).send({ success: false, msg: "Something wrong" });
      }
    });
  } catch (error) {
    next(error)
  }
};

module.exports = {
  loadOrderPlaced,
  loadOrderDetails,
  proceed,
  test,
  orderEpay,
};

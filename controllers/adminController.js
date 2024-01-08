const ProductDB = require("../model/productModel");
const UserDB = require("../model/userModel");
const CategoryDB = require("../model/categoryModel");
const orderDB = require("../model/orderModel");
const couponDB = require("../model/couponModel");

const bcrypt = require("bcrypt");

const loadHome = async (req, res, next) => {
  try {
    let currentDate = new Date();

    const categoryOrders = await orderDB.aggregate([
      {
        $match: {
          status: { $ne: "pending" },
        },
      },
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.status": { $ne: "cancelled" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product_Id",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $lookup: {
          from: "categories",
          localField: "productData.category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $unwind: "$categoryData",
      },
      {
        $group: {
          _id: "$categoryData.name",
          totalQuantitySold: { $sum: "$products.quantity" },
        },
      },
      {
        $project: {
          category: "$_id",
          totalQuantitySold: 1,
          _id: 0,
        },
      },
    ]);

    let ordersCategory = {};

    categoryOrders.forEach((category) => {
      ordersCategory[category.category] = category.totalQuantitySold;
    });

    const Category = await CategoryDB.find({});

    const paymentCod1 = await orderDB.aggregate([
      { $match: { payment: "cod", "products.status": "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      { $project: { total: 1, _id: 0 } },
    ]);
    const paymentRazor1 = await orderDB.aggregate([
      { $match: { payment: "razorpay", "products.status": "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      { $project: { total: 1, _id: 0 } },
    ]);

    let paymentRazor;
    let paymentCod;
    if (paymentRazor1.length > 0) {
      paymentRazor = parseInt(paymentRazor1[0].total);
    } else {
      paymentRazor = 0;
    }

    if (paymentCod1.length > 0) {
      paymentCod = parseInt(paymentCod1[0].total);
    } else {
      paymentCod = 0;
    }

    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(currentDate);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const dailyOrders = await orderDB.aggregate([
      {
        $match: {
          status: {
            $ne: "pending",
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
            },
          },
          dailyrevenue: {
            $sum: "$totalAmount",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $limit: 7,
      },
    ]);

    const result = dailyOrders || 0;
    const Revenue = paymentCod + paymentRazor;
    const countOrder = await orderDB.find().countDocuments();
    const countProduct = await ProductDB.find().countDocuments();
    const countCategory = await CategoryDB.find().countDocuments();

    const userCount = await UserDB.find({ is_admin: "0" }).countDocuments();
    res.render("index", {
      ordersCategory,
      Category,
      paymentCod,
      paymentRazor,
      result,
      Revenue,
      countOrder,
      countCategory,
      countProduct,
      userCount,
    });
  } catch (error) {
    next(error);
  }
};
const loadUser = async (req, res, next) => {
  try {
    const user = await UserDB.find({ is_admin: "0" });
    res.render("userDetails", { user });
  } catch (error) {
    next(error);
  }
};
const loadCategory = async (req, res, next) => {
  try {
    const category = await CategoryDB.find({});
    res.render("Category", { category });
  } catch (error) {
    next(error);
  }
};
const loadaddCategory = async (req, res, next) => {
  try {
    res.render("addCategory", { message: "" });
  } catch (error) {
    next(error);
  }
};

// INSERT CATEGORY (POST)
const insertCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const alreadyExist = await CategoryDB.findOne({ name: name });

    if (alreadyExist) {
      res.render("addCategory", { message: "Category already Exist !!!" });
    } else {
      const categoryData = new CategoryDB({
        name: name,
        description: description,
      });

      const adddata = await categoryData.save();

      if (adddata) {
        res.redirect("/admin/category");
      } else {
        res.render("addCategory", { message: "something wrong!!" });
      }
    }
  } catch (error) {
    next(error);
  }
};

//EDIT CATEGORY LOAD(GET)
const loadeditCategory = async (req, res, next) => {
  try {
    const name = req.query.name;
    const catData = await CategoryDB.findOne({ name: name });
    res.render("editCategory", { catData });
  } catch (error) {
    console.log(error.message);
  }
};

//EDIT CATEGORY LOAD(POST)
const editCategory = async (req, res, next) => {
  try {
    const qname = req.query.name;

    const { name, description } = req.body;

    await CategoryDB.updateOne(
      { name: qname },
      { $set: { name: name, description: description } }
    );
    res.redirect("/admin/category");
  } catch (error) {
    next(error);
  }
};

// LOAD LOGIN PAGE
const loadLogin = async (req, res, next) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    next(error);
  }
};

// LOAD LOGIN PAGE
const blockUser = async (req, res, next) => {
  try {
    const userId = req.query._id;
    await UserDB.updateOne(
      { _id: userId },
      { $set: { is_blocked: true, is_verified: 0 } }
    );
    res.redirect("/admin/userDetails");
  } catch (error) {
    next(error);
  }
};
const unblockUser = async (req, res, next) => {
  try {
    const userId = req.query._id;
    await UserDB.updateOne(
      { _id: userId },
      { $set: { is_blocked: false, is_verified: 1 } }
    );
    res.redirect("/admin/userDetails");
  } catch (error) {
    next(error);
  }
};

//ADMIN LOGIN(POST)
const adminLoginVerify = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find the user based on the username or email
    const user = await UserDB.findOne({ $or: [{ email }, { email: email }] });
    if (!user) {
      return res.render("adminLogin", {
        message: "Invalid username or password",
      });
    }

    // Check if the user's account is verified
    if (user.is_admin == 0) {
      return res.render("adminLogin", { message: "Account not verified" });
    }

    // Compare the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.render("adminLogin", {
        message: "Invalid username or password",
      });
    }
    // Set up a session or token for authentication
    req.session.admin_id = user._id;
    console.log(req.session.admin_id, ":session admin");
    res.redirect("/admin/dashboard"); //{messageS:'login succesfull'}
  } catch (error) {
    next(error);
    res.render("adminLogin", { message: "An error occurred during sign in" });
  }
};

//LOGOUT BTN DESTROY SESSION
const adminLogout = async (req, res, next) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    next(error);
  }
};

const loadOrder = async (req, res, next) => {
  try {
    const order = await orderDB.find().populate("products.product_Id");
    res.render("Admin_Order", { order });
  } catch (error) {
    next(error);
  }
};

const OrderCancel = async (req, res, next) => {
  try {
    const product = req.body.productID;
    const quantity = req.body.quantity;
    const ProId = req.body.proId;
    const userId = req.session.user_id;
    const total = req.body.total;
    const payment = req.body.payment;

    const datas = await orderDB.findOneAndUpdate(
      { "products._id": product },
      { $set: { "products.$.status": "canceled" } }
    );

    const incProduct = await ProductDB.findOneAndUpdate(
      { _id: ProId },
      { $inc: { quantity: quantity } }
    );
    if (payment == "razorpay" || payment == "wallet") {
      await UserDB.findByIdAndUpdate(
        { _id: userId },
        {
          $inc: { wallet: total },
          $push: {
            walletHistory: {
              date: new Date(),
              amount: total,
              description: `Refunded for Order cancel`,
            },
          },
        }
      );
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

const loadCoupon = async (req, res, next) => {
  try {
    const coupons = await couponDB.find({});
    res.render("coupon", { coupons });
  } catch (error) {
    next(error);
  }
};

const loadaddCoupon = async (req, res, next) => {
  try {
    res.render("addCoupon");
  } catch (error) {
    next(error);
  }
};

//POST ADD COUPON
const addCoupon = async (req, res, next) => {
  try {
    const userid = req.session.user_id;
    const { code, description, discount, start, end, min, max } = req.body;
    const exist = await couponDB.findOne({ code: code.toUpperCase() });
    if (exist) {
      // req.flash("err", "Coupon name already exist..");
      return res.redirect("/admin/addCoupon");
    }

    const couponData = new couponDB({
      code: code.toUpperCase(),
      description: description,
      discount: discount,
      startingDate: start,
      expiryDate: end,
      minimum: min,
      maximum: max,
    });

    const coupons = await couponData.save();

    res.redirect("/admin/coupon");
  } catch (error) {
    next(error);
  }
};

const loadeditCoupon = async (req, res) => {
  try {
    const id = req.query.id;

    const coupon = await couponDB.findOne({ _id: id });

    res.render("editCoupon", { coupon });
  } catch (error) {
    next(error);
  }
};

const verifyeditCoupon = async (req, res, next) => {
  try {

    const { code, description, discount, start, end, min, max } = req.body;
    await couponDB.updateOne(
      { code: code },
      {
        $set: {
          description: description,
          discount: discount,
          startingDate: start,
          expiryDate: end,
          minimum: min,
          maximum: max,
        },
      }
    );
    res.redirect("/admin/coupon");
  } catch (error) {
    next(error);
  }
};

const UpdateOrderStatus = async (req, res, next) => {
  try {
    const productId = req.body.productID;
    const value = req.body.value;
    const orderId = req.body.orderid;
    await orderDB.findOneAndUpdate(
      { _id: orderId, "products._id": productId },
      { $set: { "products.$.status": value } }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

//sales Report(get)
const salesReport = async (req, res, next) => {
  try {
    const totalAmount = await orderDB.aggregate([
      { $unwind: "$products" },
      { $match: { "products.status": "delivered" } },
      { $group: { _id: null, total: { $sum: "$products.total" } } },
    ]);
    const totalSold = await orderDB.aggregate([
      { $unwind: "$products" },
      { $match: { "products.status": "delivered" } },
      { $group: { _id: null, total: { $sum: "$products.quantity" } } },
      { $project: { total: 1, _id: 0 } },
    ]);

    const product = await orderDB
      .find({ "products.status": "delivered" })
      .populate("products.product_Id")
      .te("user");
    res.render("sales-report", {
      totalAmount,
      totalSold,
      product,
    });
  } catch (err) {
    next(err);
  }
};

const sortSalesReport = async (req, res, next) => {
  try {
    let fromDate = req.body.fromDate ? new Date(req.body.fromDate) : null;
    fromDate.setHours(0, 0, 0, 0);
    let toDate = req.body.toDate ? new Date(req.body.toDate) : null;
    toDate.setHours(23, 59, 59, 999);

    const currentDate = new Date();

    if (fromDate && toDate) {
      if (toDate < fromDate) {
        const temp = fromDate;
        fromDate = toDate;
        toDate = temp;
      }
    } else if (fromDate) {
      toDate = currentDate;
    } else if (toDate) {
      fromDate = currentDate;
    }
    var matchStage = {
      "products.status": "delivered",
    };

    const totalAmount = await orderDB.aggregate([
      {
        $match: {
          expectedDelivery: { $gte: fromDate, $lte: toDate },
        },
      },
      { $unwind: "$products" },
      { $match: matchStage }, // This is where you would put your additional matching criteria if needed
      {
        $group: {
          _id: null,
          total: { $sum: "$products.total" },
        },
      },
    ]);

    const totalSold = await orderDB.aggregate([
      {
        $match: {
          expectedDelivery: { $gte: fromDate, $lte: toDate },
        },
      },
      { $unwind: "$products" },
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: "$products.quantity" } } },
      { $project: { total: 1, _id: 0 } },
    ]);

    const product = await orderDB
      .find({
        expectedDelivery: { $gte: fromDate, $lte: toDate },
        "products.status": "delivered",
      })
      .populate("products.product_Id")
      .populate("user");
    res.render("sales-report", {
      totalAmount,
      totalSold,
      product,
    });
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  loadHome,
  loadCategory,
  loadUser,
  loadaddCategory,
  loadeditCategory,
  loadLogin,
  loadOrder,
  loadCoupon,
  adminLoginVerify,
  adminLogout,
  insertCategory,
  blockUser,
  unblockUser,
  editCategory,
  OrderCancel,
  loadaddCoupon,
  addCoupon,
  UpdateOrderStatus,
  salesReport,
  sortSalesReport,
  loadeditCoupon,
  verifyeditCoupon,
};

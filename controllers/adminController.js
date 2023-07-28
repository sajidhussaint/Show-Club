const ProductDB = require("../model/productModel");
const UserDB = require("../model/userModel");
const CategoryDB = require("../model/categoryModel");
const bcrypt = require("bcrypt");

const loadHome = async (req, res) => {
  try {
    const userCount = await UserDB.find({ is_admin: "0" }).count();
    res.render("index", { userCount });
  } catch (error) {
    console.log(error.message);
  }
};
const loadUser = async (req, res) => {
  try {
    const user = await UserDB.find({ is_admin: "0" });
    res.render("userDetails", { user });
  } catch (error) {
    console.log(error.message);
  }
};
const loadCategory = async (req, res) => {
  try {
    const category = await CategoryDB.find({});
    res.render("Category", { category });
  } catch (error) {
    console.log(error.message);
  }
};
const loadaddCategory = async (req, res) => {
  try {
    res.render("addCategory");
  } catch (error) {
    console.log(error.message);
  }
};

// INSERT CATEGORY (POST)
const insertCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

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
  } catch (error) {
    console.log(error.message);
  }
};

//EDIT CATEGORY LOAD(GET)
const loadeditCategory = async (req, res) => {
  try {
    const name=req.query.name;
    const catData=await CategoryDB.findOne({name:name})
    res.render("editCategory",{catData});
  } catch (error) {
    console.log(error.message);
  }
};

//EDIT CATEGORY LOAD(POST)
const editCategory = async (req, res) => {
  try {
    const qname=req.query.name

    const { name, description } = req.body;

    await CategoryDB.updateOne({name:qname},{ $set: { name:name,description:description} })
    res.redirect("/admin/category");
    
  } catch (error) {
    console.log(error.message);
  }
};



// LOAD LOGIN PAGE
const loadLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};

// LOAD LOGIN PAGE
const blockUser = async (req, res) => {
  try {
    const userId=req.query._id
    await UserDB.updateOne({ _id:userId }, { $set: { is_blocked:true,is_verified:0 } });
    res.redirect("/admin/userDetails");
  } catch (error) {
    console.log(error.message);
  }
};
const unblockUser = async (req, res) => {
  try {
    const userId=req.query._id
    await UserDB.updateOne({ _id:userId }, { $set: { is_blocked:false ,is_verified:1} });
    res.redirect("/admin/userDetails");
  } catch (error) {
    console.log(error.message);
  }
};

//ADMIN LOGIN(POST)
const adminLoginVerify = async (req, res) => {
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
    console.log(req.session.admin_id, ":session is created by admin");
    res.redirect("/admin/dashboard"); //{messageS:'login succesfull'}
  } catch (err) {
    console.error("Error during sign in:", err);
    res.render("adminLogin", { message: "An error occurred during sign in" });
  }
};

//LOGOUT BTN DESTROY SESSION
const adminLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadHome,
  loadCategory,
  loadUser,
  loadaddCategory,
  loadeditCategory,
  loadLogin,
  adminLoginVerify,
  adminLogout,
  insertCategory,
  blockUser,
  unblockUser,
  editCategory

};

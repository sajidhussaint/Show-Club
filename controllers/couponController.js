const couponDB = require("../model/couponModel");
const cartDB = require("../model/cartModel");
const couponHelper = require( '../helpers/couponHelper' )



const applyCoupon = async (req, res) => {
    try {
      const { couponCode, total } = req.body;
      const user = req.session.user_id;
      const coupon = await couponDB.find({ code: couponCode });
      // If coupon exists
      if (coupon && coupon.length > 0) {
          const now = new Date();
        // if coupon not expired
        if (coupon[0].expiryDate>= now && coupon[0].startingDate <= now) {
          // Convert the user IDs in the "users" array to strings for comparison
          const userIds = coupon[0].user.map((userId) => String(userId));
          // Check if the desiredUserId is present in the array
          const userExist = userIds.includes(user);
          // If user already used the coupon
          if (userExist) {
            res.json({
              success: false,
              message: "Coupon already used by the user",
            });
          } else {
            // Checking minimum Amount
            if (total < coupon[0].minimum) {
              res.json({
                success: false,
                message: "Minimums amount not reached",
              });
            } else {
              // Success
              await cartDB.updateOne(
                { userId: user },
                {
                  $set: {
                    coupon: coupon[0]._id,
                  },
                }
              );
              const cart = await cartDB.findOne({ userId: user });
              let discounted;
              if (cart.coupon) {
                discounted = await couponHelper.discountPrice(cart.coupon, total);
              }
              res.json({
                success: true,
                message: "Available",
                discounted: discounted,
              });
            }
          }
        } else {
          res.json({ success: false, message: "Invalid Coupon, out dated" });
        }
      } else {
        res.json({ success: false, message: "Invalid Coupon" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };


  module.exports={applyCoupon}
const couponDB = require( '../model/couponModel' )

module.exports = {

    discountPrice : async ( couponId, cartTotal ) => {
        const coupon = await couponDB.findById(couponId);
  if(coupon){
      let discountAmount = 0;
      discountAmount =  Math.round((coupon.discount / 100) * cartTotal);
      // Calculate the discounted total
      const discountedTotal =Math.round( cartTotal - discountAmount);
      return { discountAmount, discountedTotal }
  }else{
    return null;
  }

    }      
}
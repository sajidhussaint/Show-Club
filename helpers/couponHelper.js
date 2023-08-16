const couponDB = require( '../model/couponModel' )

module.exports = {

    discountPrice : async ( couponId, cartTotal ) => {
        const coupon = await couponDB.findById(couponId);
        console.log('running helper');
  if(coupon){
      let discountAmount = 0;
      discountAmount =  Math.round((coupon.discount / 100) * cartTotal);
      // Calculate the discounted total
      const discountedTotal =Math.round( cartTotal - discountAmount);
      console.log(discountAmount,discountedTotal,'this discounted');
      return { discountAmount, discountedTotal }
  }else{
    return null;
  }

    }      
}
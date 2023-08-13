const cartDB = require("../model/cartModel");
const ProductDB = require("../model/productModel");
const UserDB = require("../model/userModel");
const AddressDB = require("../model/addressModel");
const orderDB = require("../model/orderModel");
const mongoose = require("mongoose");

const proceed=async(req,res)=>{
    try {
        const userid=req.session.user_id
        const address=req.body.address
        const payment=req.body.payment
        const grandTotal=req.body.total

        const user=await UserDB.findOne({ _id : userid })
        const cartData = await cartDB.findOne({ userId : userid })

        const cartProducts = cartData.product
        let status = payment == 'cod' ? 'placed' : 'pending'

        const orderDate = new Date(); 
        const delivery = new Date(orderDate.getTime() + (10 * 24 * 60 * 60 * 1000)); 
        const deliveryDate = delivery.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).replace(/\//g, '-');
        const order = new orderDB({
            user : userid,
            deliveryAddress : address,
            userName : user.name,
            totalAmount : grandTotal,
            status : status,
            date : orderDate,
            payment : payment,
            products : cartProducts,
            expectedDelivery : deliveryDate
        })

        const orderData = await order.save()

        for(let i=0;i<cartProducts.length;i++){
            await ProductDB.findByIdAndUpdate({_id:cartProducts[i].product_Id},{$inc:{
             
              quantity:-cartProducts[i].quantity
            }})
          }
          await cartDB.findOneAndDelete({userId:userid})
          res.json({ success : true })

    } catch (error) {
        console.log(error.message)
    }
}

const loadOrderPlaced=async(req,res)=>{
    try {
          const id=req.session.user_id
         const order=await orderDB.findOne({user:id}).populate(
           "products.product_Id"
         );
   
        res.render('orderPLaced',{order})
        
    } catch (err) {
        console.log(err.message);
    }
}



module.exports={loadOrderPlaced,proceed}
const AddressDB = require("../model/addressModel");


const loadAddAddress=async(req,res)=>{
  try {
      res.render('addAddress')
  } catch (error) {
      console.log(error.message)
  }
}
const loadeditAddress=async(req,res)=>{
  try {
   
    const index=req.query.index;
    const addressId=req.query.addressId;
    const userId = req.session.user_id;
    const data=await AddressDB.findOne({user:userId})
    const value = data.address[index];
      res.render('editAddress',{value,index})
  } catch (error) {
      console.log(error.message)
  }
}

const addAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const address = await AddressDB.findOne({ user: userId });
    const {
      country,
      sname,
      housename,
      city,
      district,
      state,
      pin,
      email,
      mobile,
      fname,
    } = req.body;

    if (address) {
      await AddressDB.updateOne(
        { user: userId },
        {
          $push: {
            address: {
              fname: fname,
              sname: sname,
              mobile: mobile,
              email: email,
              housename: housename,
              city: city,
              state: state,
              district: district,
              country: country,
              pin: pin,
            },
          },
        }
      );
    }else{
        const data = new AddressDB({
            user: userId,
            address: [
              {
                fname: fname,
                sname: sname,
                mobile: mobile,
                email: email,
                housename: housename,
                city: city,
                state: state,
                district: district,
                country: country,
                pin: pin,
              }
            ]
          });
      
          const Adata = await data.save();
    }
res.redirect('/checkout')
    
  } catch (error) {
    console.log(error.message);
  }
};


const addAddressPage = async (req, res) => {
  try {
    const index=req.query.index;//
    const userId = req.session.user_id;
    const address = await AddressDB.findOne({ user: userId });
    const value = address.address[index];//
    const {
      country,
      sname,
      housename,
      city,
      district,
      state,
      pin,
      email,
      mobile,
      fname,
    } = req.body;

    if (address) {
      console.log('WORKING ADDRES');
      await AddressDB.updateOne(
        {"address._id": value._id },
        {
          $set: {
            "address.$.fname": fname,
            "address.$.sname": sname,
            "address.$.mobile": mobile,
            "address.$.email": email,
            "address.$.housename": housename,
            "address.$.city": city,
            "address.$.state": state,
            "address.$.district": district,
            "address.$.country": country,
            "address.$.pin": pin,
        },
        }
      );
    }else{
        const data = new AddressDB({
            user: userId,
            address: [
              {
                fname: fname,
                sname: sname,
                mobile: mobile,
                email: email,
                housename: housename,
                city: city,
                state: state,
                district: district,
                country: country,
                pin: pin,
              }
            ]
          });
      
          const Adata = await data.save();
    }
res.redirect('/profile')
    
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = { addAddress,loadAddAddress,addAddressPage ,loadeditAddress};

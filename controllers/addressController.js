const AddressDB = require("../model/addressModel");

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

module.exports = { addAddress };

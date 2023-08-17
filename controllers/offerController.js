const offerDB = require("../model/offerModel");



const getOffer = async (req, res) => {
  try {
    const offers = await offerDB.find({});
    res.render("offers", {
      offers,
      now: new Date(),
      admin: true,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const getAddOffer=async(req,res)=>{
    try {

        res.render( 'add-offer', {
            err : 'kkk',
            admin : true
        })
        
    } catch (error) {
        console.log(error.message)
    }
}
const addOffer=async(req,res)=>{
    try {
        const { search, page } = req.query
        const { startingDate, expiryDate, percentage } = req.body
        const name = req.body.name.toUpperCase()
        const offerExist = await offerDB.findOne({ name : name })
        if( offerExist ) {
            // req.flash('err','Offer already exists!!!')
            res.redirect('/admin/add-offer')
        } else {
         const offer = new offerDB({
            name : name,
            startingDate : startingDate, 
            expiryDate : expiryDate,
            percentage : percentage,
            search : search,
            page : page
         }) 
         await offer.save()
         res.redirect('/admin/offers')
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {getOffer,getAddOffer,addOffer};

const Banner = require('../model/bannerModel')

const loadBanner = async (req , res , next) => {
    try {

        const banners = await Banner.find({})
        res.render('banner' , {banners})
        
    } catch (err) {
        console.log(err.message);
    }
}

const loadAddBanner = async (req , res , next) => {
    try {

        res.render('addBanner')
        
    } catch (err) {
        next(err.message)
    }
}

const addBanner = async (req , res , next) => {
    try {

       const { info , title , description } = req.body
       const image = req.file.filename
       console.log(image)
       const banner = new Banner({
            image : image,
            info : info,
            description : description,
            title : title
       })

       await banner.save()

       res.redirect('/admin/banner')
        
    } catch (err) {
        next(err.message)
    }
}

const loadEditBanner = async (req , res , next) => {
    try {

        const id = req.query.id
        const banner = await Banner.findOne({ _id : id })
        res.render('editBanner', { banner })
        
    } catch (err) {
        next(err.message)
    }
}

const editBanner = async (req , res , next) => {
    try {

        const id = req.body.id
        const { info , title , description } = req.body
        
        if(req.file && req.file.filename) {
            const image = req.file.filename
            await Banner.findOneAndUpdate({ _id : id },{
                $set:{
                    image : image,
                    info : info,
                    description : description,
                    title : title
                }
            })
        }else{
            await Banner.findOneAndUpdate({ _id : id },{
                $set:{
                    info : info,
                    description : description,
                    title : title
                }
            })
        }

        res.redirect('/admin/banner')
        
    } catch (err) {
        next(err.message)
    }
}

const deleteBanner = async (req , res , next) => {
    try {

        const id = req.query.id
        await Banner.findOneAndDelete({ _id : id })
        res.redirect('/admin/banner')
        
    } catch (err) {
        next(err.message)
    }
}

module.exports = {
    loadBanner,
    loadAddBanner,
    addBanner,
    loadEditBanner,
    editBanner,
    deleteBanner
}

const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, './public/admin/IMAGES_DB')
    },
    filename: function (req, file, cb) {

        cb(null, `${Date.now()}SHOWCLUB-${file.originalname}`)
    }
})

const upload = multer({ storage: storage })
module.exports = upload
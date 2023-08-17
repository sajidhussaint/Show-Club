
const multer = require('multer')
const path = require('path')
const sharp = require('sharp');


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         return cb(null, './public/admin/IMAGES_DB')
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const processedFilename = `${uniqueSuffix}-SHOWCLUB-${file.originalname}`;

//         // Process the image using sharp before generating the filename
//         sharp(file.path)
//             .resize(1280, 1280) // Resize to 1280x1280
//             .toFile(path.join('./public/admin/IMAGES_DB', processedFilename), (err, info) => {
//                 if (err) {
//                     console.error('Error processing image with sharp:', err);
//                 } else {
//                     console.log('Image processed and saved:', info);
//                 }
//             });

//         cb(null, processedFilename);
//     }
// });




// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         return cb(null, './public/admin/IMAGES_DB')
//     },
//     filename: function (req, file, cb) {
//         // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const processedFilename = `${Date.now()}SHOWCLUB-${file.originalname}`;

//         // Process the image using sharp before generating the filename
//         sharp(file.path)
//             .resize(1280, 1280) // Resize to 1280x1280
//             .toFile(path.join('./public/admin/IMAGES_DB', processedFilename), (err, info) => {
//                 if (err) {
//                     console.error('Error processing image with sharp:', err);
//                 } else {
//                     console.log('Image processed and saved:', info);
//                 }
//             });

//         cb(null, processedFilename);
//     }
// });





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
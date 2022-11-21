const multer = require('multer')

const productStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/productImages/')
    },
    filename: function (req, file, callback) {
        const unique = file.originalname.substr(file.originalname.lastIndexOf('.'))
        callback(null, file.fieldname + '-' + Date.now() + unique)
    }
})
const product = multer({ storage: productStorage })


module.exports = product;
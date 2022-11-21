const multer = require('multer')

const bannerStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/bannerImages')
    },
    filename: function (req, file, callback) {
        const unique = file.originalname.substr(file.originalname.lastIndexOf('.'))
        callback(null, file.fieldname + '-' + Date.now() + unique)
    }
})
const banner = multer({ storage: bannerStorage })


module.exports = banner;
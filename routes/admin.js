const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');
const product = require('../middleware/productMulter');
const session = require('../middleware/adminSession');
const banner = require('../middleware/bannerMulter');



router.get('/', session, controller.adminHome)

router.get('/admin-login', controller.getadminLogin)

router.post('/admin-login', controller.postAdminLogin)

router.get('/admin-logout', controller.adminLogout)

router.get('/productList', session, controller.productList)

router.get('/userList', session, controller.userList)

router.get('/orderDetails', session, controller.orderDetails)

router.get('/addProducts', session, controller.getaddProducts)

router.post('/addProducts', product.array('productImage', 3), controller.postaddProducts)

router.get('/editProducts/:id', session, controller.geteditProducts)

router.post('/editProducts/:id', session, controller.posteditProducts)

router.get('/blockUser/:id', session, controller.blockUser)

router.get('/unblockUser/:id', session, controller.unblockUser)

router.get('/adminCategory', session, controller.getadminCategory)

router.post('/adminCategory', session, controller.postadminCategory)

router.get('/error-404', controller.errorHandling)

router.post('/delProduct/:id', session, controller.deleteProduct)

router.post('/delCategory/:category', session, controller.deleteCategory)

router.get('/categorizedProducts/:category', controller.getcateProducts)

router.get('/orderSummary/:orderId', session, controller.orderSummary)

router.post('/statusUpdate/:orderId', session, controller.updateStatus)

router.get('/couponDetails', session, controller.getCoupon)

router.get('/addCoupon', session, controller.getAddCoupons)

router.post('/addCoupon', controller.postAddCoupons)

router.get('/couponStatus/:couponId', session, controller.changeCouponStatus)

router.get('/getbanner', session, controller.getBanner)

router.post('/addbanner', banner.array('bannerImage', 2), controller.addBanner)

router.get('/bannerStatus/:bannerId', session, controller.bannerStatus)



module.exports = router;
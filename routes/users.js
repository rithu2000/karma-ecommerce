const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const session = require('../middleware/userSession');
const block = require('../middleware/blockedUser');



router.get('/', controller.homePage);

router.get('/login', controller.showLogin);

router.get('/signup', controller.showSignup);

router.post('/signup', controller.doSignup);

router.post('/login', controller.doLogin);

router.get('/logout', session, block, controller.Logout);

router.get('/category', controller.shopCategory);

router.get('/category/:category', controller.categoryProduct);

router.get('/productDetails/:id', controller.productDetails);

router.get('/userProfile', session, block, controller.userProfile);

router.get('/otp-page', session, block, controller.getotppage);

router.post('/verifyotp', session, block, controller.postotppage);

router.get('/cart', session, block, controller.cart);

router.get('/cart/:proId', session, block, controller.addToCart);

router.get('/checkout', session, block, controller.getCheckout);

router.post('/checkout/:CartId/:amount', session, block, controller.postCheckout);

router.get('/confirm', session, block, controller.orderSuccess);

router.get('/orderSummary/:orderId', session, block, controller.postOrderSuccess)

router.get('/removeCart/:proid', session, block, controller.removeCartItem);

router.get('/quantityDec/:proid', session, block, controller.QuantityDec);

router.get('/quantityInc/:proid', session, block, controller.QuantityInc)

router.post('/verifyPayment', session, block, controller.postVerifyPayment)

router.post('/paymentFailed', session, block, controller.postPaymentFailed)

router.get('/myOrders', session, block, controller.userOrders)

router.post('/orderCancel/:orderId', session, block, controller.orderCancel)

router.delete('/deleteAddress/:index', session, block, controller.deleteAddress)

router.post('/redeemCoupon/:coupCode/:total', session, block, controller.redeemCoupon)

router.post('/wishlist/:proId', controller.addToWishlist)

router.get('/wishlist', session, block, controller.viewWishlist)

router.delete('/deletewishlist/:proId', controller.deleteWishlistItem)

router.get('/getdate', controller.getdate)


module.exports = router;
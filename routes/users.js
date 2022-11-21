const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const session = require('../middleware/userSession');


router.get('/', controller.homePage);

router.get('/login', controller.showLogin);

router.get('/signup', controller.showSignup);

router.post('/signup', controller.doSignup);

router.post('/login', controller.doLogin);

router.get('/logout', session, controller.Logout);

router.get('/category', controller.shopCategory);

router.get('/category/:category', controller.categoryProduct);

router.get('/productDetails/:id', controller.productDetails);

router.get('/userProfile', session, controller.userProfile);

router.get('/otp-page', session, controller.getotppage);

router.post('/verifyotp', session, controller.postotppage);

router.get('/cart', session, controller.cart);

router.get('/cart/:proId', session, controller.addToCart);

router.get('/checkout', session, controller.getCheckout);

router.post('/checkout/:CartId/:amount', session, controller.postCheckout);

router.get('/confirm', session, controller.orderSuccess);

router.get('/orderSummary/:orderId', session, controller.postOrderSuccess)

router.get('/removeCart/:proid', session, controller.removeCartItem);

router.get('/quantityDec/:proid', session, controller.QuantityDec);

router.get('/quantityInc/:proid', session, controller.QuantityInc)

router.post('/verifyPayment', session, controller.postVerifyPayment)

router.post('/paymentFailed', session, controller.postPaymentFailed)

router.get('/myOrders', session, controller.userOrders)

router.post('/orderCancel/:orderId', session, controller.orderCancel)

router.delete('/deleteAddress/:index', session, controller.deleteAddress)

router.post('/redeemCoupon/:coupCode/:total', session, controller.redeemCoupon)

router.post('/wishlist/:proId', controller.addToWishlist)

router.get('/wishlist', session, controller.viewWishlist)

router.delete('/deletewishlist/:proId', controller.deleteWishlistItem)


module.exports = router;
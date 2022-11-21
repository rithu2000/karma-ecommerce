const db = require('../config/connection')
const collection = require('../config/collection');
const bcrypt = require('bcrypt');
require('dotenv').config()
const { userCollection } = require('../config/collection');
const userSchema = require('../models/userModel');
const productSchema = require('../models/productModel');
const accountSid = process.env.twillioid;
const authToken = process.env.twillioToken;
const client = require('twilio')(accountSid, authToken);
const otpGenerator = require('otp-generator');
const { reservationsUrl } = require('twilio/lib/jwt/taskrouter/util');
const cartSchema = require('../models/cartModel');
const categorySchema = require('../models/categoryModel');
const orderSchema = require('../models/orderModel');
const couponSchema = require('../models/couponModel');
const bannerSchema = require('../models/bannerModel');
const wishlistSchema = require('../models/wishlistModel');

const Razorpay = require('razorpay');
var { validatePaymentVerification } = require('../node_modules/razorpay/dist/utils/razorpay-utils');

var instance = new Razorpay({
    key_id: process.env.razorId,
    key_secret: process.env.key,
});

let loginErr = null;
let errMsg = null;
const otpGen = otpGenerator.generate(5, { upperCaseAlphabets: false, specialChars: false });


module.exports = {

    addToWishlist: async (req, res, next) => {
        const productId = req.params.proId
        // console.log(productId);
        try {
            if (req.session.loggedIn) {
                const userId = req.session.user._id
                let list = await wishlistSchema.findOne({ userId: userId });
                if (list) {
                    let itemIndex = list.myWish.findIndex(p => p.productId == productId);
                    if (itemIndex > -1) {
                        list.myWish.splice(itemIndex, 1)
                        await list.save()
                        // res.json({ status: true })
                    } else {
                        list.myWish.push({ productId });
                    }
                    await list.save()
                    res.redirect('/wishlist');
                } else {
                    list = new wishlistSchema({
                        userId: userId,
                        myWish: [{ productId }],
                    });
                    await list.save()
                    res.redirect('/wishlist');
                }
            } else {
                res.redirect('/login');
            }
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    viewWishlist: async (req, res, next) => {
        try {
            const user = req.session.user
            const userId = req.session.user._id
            const wishlist = await wishlistSchema.findOne({ userId: userId }).populate("myWish.productId").exec()
            if (wishlist) {
                req.session.wishlistNumber = wishlist.myWish.length
            }
            const viewcart = await cartSchema.findOne({ userId: userId }).populate("products.productId").exec()
            if (viewcart) {
                req.session.cartNumber = viewcart.products.length
                cartNum = req.session.cartNumber
            }
            res.render('users/wishlist', { wishproducts: wishlist, wishNum: req.session.wishlistNumber, cartNum, user }
            )
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    deleteWishlistItem: async (req, res, next) => {
        let productId = req.params.proId
        let userId = req.session.user._id
        try {
            let wishlist = await wishlistSchema.findOne({ userId });
            let itemIndex = wishlist.myWish.findIndex(p => p._id == productId);
            console.log(itemIndex);
            wishlist.myWish.splice(itemIndex, 1)
            await wishlist.save()
            res.json({ status: true })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    redeemCoupon: async (req, res, next) => {
        try {
            const userId = req.session.user._id;
            const coupCode = req.params.coupCode;
            const total = req.params.total;

            // console.log(coupCode);
            console.log(total);

            const coupon = await couponSchema.findOne({ couponCode: coupCode }).exec()
            // console.log(coupon);
            if (coupon) {
                req.session.couponId = coupon._id
                // console.log(req.session.couponId);
                // console.log(coupon.usedUsers,'11111');
                // console.log(userId);
                if (coupon.usedUsers.filter(e => e.userId.toString() === userId).length > 0) {
                    console.log('nddd');
                    res.json({ alreadyApplied: true })

                } else {
                    let today = new Date()
                    let str = today.toJSON().slice(0, 10)
                    // console.log(str);
                    let coustr = coupon.expDate.toJSON().slice(0, 10)
                    // console.log(coustr);
                    if (coupon.isActive && str <= coustr) {

                        if (!req.session.coupon) {
                            res.json(coupon)
                            req.session.coupon = 1

                        } else {
                            res.json({ alreadyApplied: true })
                        }

                    } else {
                        res.json({ expired: true })
                    }
                }
            } else {
                res.json({ invalidCoupon: true })
            }
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    postCheckout: async (req, res, next) => {
        try {
            let Amount = req.params.amount
            console.log(req.body.total);
            user = req.session.user
            userId = req.session.user._id
            const addressIndex = req.body.index
            // console.log(req.body);

            let userOne = await userSchema.findById(userId)
            let deliveryAddress = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                number: req.body.number,
                address: req.body.address,
                city: req.body.city,
                district: req.body.district,
                country: req.body.country,
                zipcode: req.body.zipcode
            }
            if (addressIndex) {
                userOne.address[addressIndex] = deliveryAddress
            } else {
                userOne.address.push(deliveryAddress)
            }
            await userOne.save()


            await cartSchema.findById(req.params.CartId).then(async (result) => {
                let cart = result
                if (req.body.paymentMethod === 'Cash On Delivery') {
                    const newOrder = new orderSchema({
                        date: new Date().toLocaleDateString(),
                        time: new Date().toLocaleTimeString(),
                        userId: cart.userId,
                        products: cart.products,
                        quantity: cart.quantity,
                        discount: cart.total - Amount,
                        total: Amount,
                        address: req.body,
                        paymentStatus: 'Payment Pending',
                        orderStatus: 'Order Placed'
                    })


                    if (req.body.total != cart.total) {
                        let couponId = req.session.couponId
                        // console.log(couponId);
                        let findCoupon = await couponSchema.findById(couponId)
                        // console.log(findCoupon);
                        findCoupon.usedUsers.push({ userId })
                        await findCoupon.save()
                    } else {
                        console.log('equallll');
                    }

                    await newOrder.save().then((result) => {
                        // console.log('result', result);
                        req.session.orderId = result._id
                        cartSchema.findOneAndRemove({ userId: result.userId }).then((result))
                        res.json({ cashOnDelivery: true })
                    })

                } else if (req.body.paymentMethod === 'Online Payment') {
                    const newOrder = new orderSchema({
                        date: new Date().toLocaleDateString(),
                        time: new Date().toLocaleTimeString(),
                        userId: cart.userId,
                        products: cart.products,
                        discount: cart.total - Amount,
                        total: Amount,
                        address: req.body,
                        paymentStatus: 'Payment Success',
                        orderStatus: 'Order Placed'
                    })


                    if (req.body.total != cart.total) {
                        let couponId = req.session.couponId
                        // console.log(couponId);
                        let findCoupon = await couponSchema.findById(couponId)
                        // console.log(findCoupon);
                        findCoupon.usedUsers.push({ userId })
                        await findCoupon.save()
                    } else {
                        console.log('equallll');
                    }

                    newOrder.save().then((result) => {
                        let userOrderData = result;
                        req.session.orderId = result._id
                        cartSchema.findOneAndRemove({ userId: result.userId }).then((result) => {
                            instance.orders.create({
                                amount: Amount * 100,
                                currency: "INR",
                                receipt: "" + result._id,
                            }, (err, order) => {
                                // console.log(order);
                                let response = {
                                    onlinePayment: true,
                                    razorpayOrderData: order,
                                    userOrderData: userOrderData
                                }
                                res.json(response)
                            })
                        })
                    })
                }
            })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    getCheckout: async (req, res, next) => {
        try {
            user = req.session.user
            let userId = req.session.user._id
            let result = await cartSchema.find({ userId: req.session.user._id }).populate('products.productId').exec()
            // console.log(result);
            let userDetails = await userSchema.findById(userId)
            // console.log(userDetails);
            cartNum = req.session.cartNum
            res.render('users/checkout', { user, cartNum, session: req.session, Cart: result[0], userDetails })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    deleteAddress: async (req, res, next) => {
        try {
            // console.log(req.params.index);
            const userId = req.session.user._id
            const addressIndex = req.params.index
            const userOne = await userSchema.findById(userId)
            userOne.address.splice(addressIndex, 1)
            await userOne.save()
            res.json({ status: true })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    orderCancel: async (req, res, next) => {
        try {
            let orderId = req.params.orderId;
            // console.log(orderId);
            let order = await orderSchema.findByIdAndUpdate(orderId, { orderStatus: 'Cancelled' })
            // console.log(order);
            res.json({ status: true })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    userOrders: async (req, res, next) => {
        try {
            user = req.session.user
            const userId = req.session.user._id
            cartNum = req.session.cartNum
            const Order = await orderSchema.find({ userId }).populate([
                {
                    path: 'userId',
                    model: 'users'
                },
                {
                    path: 'products.productId',
                    model: 'products'
                }
            ]).exec()
            Order.reverse()
            // console.log(Order);
            res.render('users/userOrders', { user, cartNum, Order: Order });
        } catch (err) {
            console.log(err);
            next(err)
        }

    },

    postVerifyPayment: async (req, res, next) => {
        try {
            console.log(req.body);
            let razorpayOrderDataId = req.body['payment[razorpay_order_id]']
            // console.log(razorpayOrderDataId);

            let paymentId = req.body['payment[razorpay_payment_id]'];
            // console.log(paymentId);

            let paymentSignature = req.body['payment[razorpay_signature]']
            // console.log(paymentSignature);

            let userOrderDataId = req.body['userOrderData[_id]']
            console.log(userOrderDataId);
            // let orderStatus = req.body['userOrderData[orderStatus]']
            // console.log(orderStatus);
            // let paymentStatus = req.body['userOrderData[paymentStatus]']
            // console.log(paymentStatus);

            validate = validatePaymentVerification({ "order_id": razorpayOrderDataId, "payment_id": paymentId }, paymentSignature, 'mCfsuoP4803LrcCKSJt2JaVo');
            if (validate) {
                console.log('payment success')
                let order = await orderSchema.findById(userOrderDataId)
                orderStatus = 'Order Placed'
                paymentStatus = 'Payment Completed'
                order.save().then((result) => {
                    res.json({ status: true })
                })
            }
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    postPaymentFailed: (req, res, next) => {
        try {
            console.log(req.body);
            res.json({ status: true })
        } catch (err) {
            console.log(err);
            next(err)
        }

    },

    postOrderSuccess: (req, res, next) => {
        try {
            // console.log(req.session.orderId, 'ordersettan');
            orderSchema.findById(req.params.orderId).then((result) => {
                // console.log(result);
                res.render('users/orderSummary', { Order: result })
            })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    orderSuccess: (req, res, next) => {
        try {
            user = req.session.user
            cartNum = req.session.cartNum
            // console.log(req.session.orderId, 94949);
            res.render('users/confirmation', { user, cartNum, orderId: req.session.orderId });
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    QuantityInc: async (req, res, next) => {
        try {
            let userCart = await cartSchema.findOne({ userId: req.session.user._id })
            let ProductIndex = userCart.products.findIndex(Product => Product._id == req.params.proid);

            let productItem = userCart.products[ProductIndex];
            userCart.total = userCart.total - (productItem.price * productItem.quantity)
            productItem.quantity = productItem.quantity + 1;
            userCart.products[ProductIndex] = productItem;
            userCart.total = userCart.total + (productItem.price * productItem.quantity)

            userCart.save();
            res.json({ status: true })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    QuantityDec: async (req, res, next) => {
        try {
            let userCart = await cartSchema.findOne({ userId: req.session.user._id })
            let ProductIndex = userCart.products.findIndex(Product => Product._id == req.params.proid);

            let productItem = userCart.products[ProductIndex];
            userCart.total = userCart.total - (productItem.price * productItem.quantity)
            productItem.quantity = productItem.quantity - 1;
            userCart.products[ProductIndex] = productItem;
            userCart.total = userCart.total + (productItem.price * productItem.quantity)

            userCart.save();
            res.json({ status: true })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    removeCartItem: async (req, res, next) => {
        try {
            let userCart = await cartSchema.findOne({ userId: req.session.user._id })
            let ProductIndex = userCart.products.findIndex(Product => Product._id == req.params.proid);

            let productItem = userCart.products[ProductIndex];
            userCart.total = userCart.total - (productItem.price * productItem.quantity)
            userCart.products.splice(ProductIndex, 1)
            userCart.save();
            res.redirect('/cart')
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    addToCart: async (req, res, next) => {
        try {
            user = req.session.user
            let quantity = 1

            const productId = req.params.proId
            const findProduct = await productSchema.findById(productId)
            const price = findProduct.price
            const name = findProduct.name
            const userId = req.session.user._id
            let cart = await cartSchema.findOne({ userId })
            if (cart) {
                let itemIndex = cart.products.findIndex(p => p.productId == productId);

                if (itemIndex > -1) {
                    let productItem = cart.products[itemIndex];
                    productItem.quantity += quantity;
                } else {
                    cart.products.push({ productId, quantity, name, price });
                }

                cart.total = cart.products.reduce((acc, curr) => {
                    return acc + curr.quantity * curr.price;
                }, 0)
                await cart.save()
                res.redirect('/cart');
            } else {
                const total = quantity * price
                cart = new cartSchema({
                    userId: userId,
                    products: [{ productId, quantity, name, price }],
                    total: total
                })
                await cart.save()
                res.redirect('/cart');
            }
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    cart: async (req, res, next) => {
        try {
            user = req.session.user
            const userId = req.session.user._id
            const viewcart = await cartSchema.findOne({ userId: userId }).populate('products.productId').exec()
            if (viewcart) {
                req.session.cartNum = viewcart.products.length
            }
            cartNum = req.session.cartNum
            res.render('users/cart', { user, cartNum, cartProducts: viewcart });
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    postotppage: async (req, res, next) => {
        try {
            // const otpGen = 1234
            const otp = req.body.otp;
            const access = true;

            if (otp == otpGen) {
                let userData = req.session.signupData
                password = await bcrypt.hash(userData.password, 10);
                const user = new userSchema({
                    name: userData.name,
                    email: userData.email,
                    mobno: userData.mobno,
                    password,
                    access
                })
                user.save()
                    .then((result) => {
                        console.log("signup success");
                        req.session.loggedIn = true;
                        req.session.user = user;
                        res.redirect('/')
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            } else {
                errMsg = 'Incorrect otp'
                res.redirect('/otp-page')
            }
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    getotppage: (req, res, next) => {
        try {
            res.redirect('/');
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    userProfile: (req, res, next) => {
        try {
            user = req.session.user
            cartNum = req.session.cartNum
            res.render('users/userProfile', { user, cartNum });
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    productDetails: (req, res, next) => {
        try {
            let proId = req.params.id
            productSchema.find({ _id: proId }, (err, results) => {
                result = results[0]
                if (err) {
                    res.send(err)
                } else {
                    user = req.session.user
                    cartNum = req.session.cartNum
                    res.render('users/productDetails', { user, result, cartNum });
                }
            })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    //category products in user side
    shopCategory: (req, res, next) => {
        try {
            categorySchema.find({}, function (err, category) {
                productSchema.find({})
                    .then((result) => {
                        user = req.session.user
                        cartNum = req.session.cartNum
                        res.render('users/userCategory', { user, result, category, cartNum })
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    categoryProduct: (req, res, next) => {
        try {
            categorySchema.find({}, function (err, category) {
                productSchema.find({ category: req.params.category })
                    .then((result) => {
                        user = req.session.user
                        cartNum = req.session.cartNum
                        res.render('users/userCategory', { user, result, category, cartNum })
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    //user homepage 
    homePage: async (req, res, next) => {
        try {
            if (req.session.loggedIn) {
                const userId = req.session.user._id
                const wishlist = await wishlistSchema.findOne({ userId: userId }).populate("myWish.productId").exec()
                if (wishlist) {
                    req.session.wishlistNumber = wishlist.myWish.length
                }
                const viewcart = await cartSchema.findOne({ userId: userId }).populate('products.productId').exec()
                if (viewcart) {
                    req.session.cartNum = viewcart.products.length
                }
            }
            productSchema.find({ status: true }).limit(8)
                .then(async (result) => {
                    let banner = await bannerSchema.find({ access: true })
                    user = req.session.user
                    wishNum = req.session.wishlistNumber
                    cartNum = req.session.cartNum
                    res.render('users/index', { user, result, cartNum, banner, wishNum })
                })
                .catch((err) => {
                    console.log(err);
                })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    // get login
    showLogin: (req, res, next) => {
        try {
            if (req.session.loggedIn) {
                res.redirect('/');
            } else {
                user = req.session.user
                cartNum = req.session.cartNum
                res.render('users/login', { user, loginErr, cartNum })
            }
            loginErr = null;
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    //get signup
    showSignup: (req, res, next) => {
        try {
            if (req.session.loggedIn) {
                res.redirect('/');
            } else {
                user = req.session.user
                cartNum = req.session.cartNum
                res.render('users/signup', { user, errMsg, cartNum })
            }
            errMsg = null;
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    //post signup
    doSignup: (req, res, next) => {
        try {
            userSchema.findOne({ email: req.body.email }).then((user) => {
                if (user) {

                    errMsg = "User exist"
                    res.redirect("/signup");

                } else {
                    return new Promise(async (resolve, reject) => {

                        const { name, email, mobno, confirmPassword } = req.body
                        let { password } = req.body

                        if (!email || !password) {
                            errMsg = "Email and Password is required"
                            console.log('errr');
                        } else {

                            if (password === confirmPassword) {
                                req.session.signupData = req.body
                                client.messages
                                    .create({
                                        body: otpGen,
                                        messagingServiceSid: 'MG4ad2aa34ef15c6ddce0a5c776cbe53ad',
                                        to: '+918301086897'
                                    })
                                    .then(message => console.log(message.sid))
                                    .done();
                                res.redirect('/otp-page')
                            } else {
                                errMsg = "Password mismatch"
                                console.log('password error');
                                res.redirect('/signup');
                            }
                        }
                    })
                }
            })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    //post login
    doLogin: (req, res, next) => {
        try {
            userSchema.findOne({ email: req.body.email }).then((user) => {
                if (user) {

                    if (user.access === true) {
                        bcrypt.compare(req.body.password, user.password).then((data) => {

                            if (data) {
                                console.log('Login Success');
                                req.session.user = user
                                req.session.loggedIn = true;
                                res.redirect('/');
                            } else {
                                console.log('Login Failed');
                                loginErr = "Invalid password";
                                console.log(req.session.userlogErr)
                                res.redirect('/login');
                            }
                        })
                    } else {
                        console.log('blocked user');
                        loginErr = "You have been restricted by the admin";
                        res.redirect('/login');
                    }
                } else {
                    console.log('Login failed');
                    loginErr = "Invalid email";
                    res.redirect('/login');
                }
            })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    // logout
    Logout: (req, res, next) => {
        try {
            req.session.destroy();
            res.redirect('/');
        } catch (err) {
            console.log(err);
            next(err)
        }
    },



};
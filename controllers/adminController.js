const db = require('../config/connection')
const collection = require('../config/collection');
const bcrypt = require('bcrypt');
const adminSchema = require('../models/adminModel');
const { userCollection } = require('../config/collection');
const userSchema = require('../models/userModel');
const productSchema = require('../models/productModel');
const categorySchema = require('../models/categoryModel');
const orderSchema = require('../models/orderModel');
const couponSchema = require('../models/couponModel');
const bannerSchema = require('../models/bannerModel');

let errMsg
let errorMsg = null

module.exports = {

    bannerStatus: async (req, res) => {
        try {
            const bannerId = req.params.bannerId;
            let banner = await bannerSchema.findOne({ _id: bannerId })
            // console.log(coupon);
            if (banner.access) {
                bannerSchema.updateOne({ _id: bannerId }, { $set: { access: false } }).then(() => {
                    res.redirect('/admin/getbanner')
                })
            } else {
                bannerSchema.updateOne({ _id: bannerId }, { $set: { access: true } }).then(() => {
                    res.redirect('/admin/getbanner')
                })
            }
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    addBanner: async (req, res, next) => {
        try {
            const image = [];
            for (file of req.files) {
                image.push(file.filename);
            }
            const banner = new bannerSchema({
                name: req.body.name,
                description: req.body.description,
                image: image
            })
            await banner.save();
            res.redirect('/admin/getbanner');
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    getBanner: async (req, res, next) => {
        try {
            let banner = await bannerSchema.find()
            res.render('admin/banner', { banner });
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    changeCouponStatus: async (req, res, next) => {
        try {
            // console.log(req.params.couponId);
            const couponId = req.params.couponId;
            let coupon = await couponSchema.findOne({ _id: couponId })
            // console.log(coupon);
            if (coupon.isActive) {
                couponSchema.updateOne({ _id: couponId }, { $set: { isActive: false } }).then(() => {
                    res.redirect('/admin/couponDetails')
                })
            } else {
                couponSchema.updateOne({ _id: couponId }, { $set: { isActive: true } }).then(() => {
                    res.redirect('/admin/couponDetails')
                })
            }
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    postAddCoupons: async (req, res, next) => {
        try {
            // console.log(req.body);
            const { name, couponCode, discount, maxlimit, expDate } = req.body
            await couponSchema.create({
                name,
                couponCode,
                discount,
                maxlimit,
                expDate
            })
            res.redirect('/admin/couponDetails');
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    getAddCoupons: (req, res, next) => {
        try {
            res.render('admin/addcoupon');
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    getCoupon: async (req, res, next) => {
        try {
            const Coupon = await couponSchema.find()
            res.render('admin/couponList', { Coupon });
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    updateStatus: async (req, res, next) => {
        try {
            const orderId = req.params.orderId;
            // console.log(req.body.status);
            await orderSchema.findByIdAndUpdate(orderId, { orderStatus: req.body.status })
            res.redirect('/admin/orderDetails')
        } catch (err) {
            console.log(err);
            next(err)
        }

    },

    orderSummary: async (req, res, next) => {
        try {
            const orderId = req.params.orderId;
            const Order = await orderSchema.findById(orderId).populate([
                {
                    path: 'userId',
                    model: 'users'
                },
                {
                    path: 'products.productId',
                    model: 'products'
                }
            ]).exec()
            console.log(Order);
            res.render('admin/adminOrderSummary', { Order });
        } catch (err) {
            console.log(err);
            next(err)
        }

    },
    // to show the categorized products
    getcateProducts: (req, res, next) => {
        try {
            productSchema.find({ category: req.params.category }, function (err, result) {
                // console.log(result);
                if (err) {
                    res.send(err);
                } else {
                    res.render('admin/categorizedProducts', { result });
                }
            })

        } catch (err) {
            next(err)
        }
    },
    //post working of edit products
    posteditProducts: (req, res, next) => {
        try {
            let proId = req.params.id
            productSchema.findByIdAndUpdate(proId, {
                name: req.body.name,
                brand: req.body.brand,
                quantity: req.body.quantity,
                category: req.body.category,
                price: req.body.price,
                description: req.body.description,
                image: req.session.body
            }).then((result) => {
            }).catch((err) => {
                console.log(err);
            })
            res.redirect('/admin/productList');
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    //getting the edit products page
    geteditProducts: (req, res, next) => {
        try {
            let proId = req.params.id
            // console.log(proId)
            productSchema.find({ _id: proId }, function (err, data) {
                if (err) {
                    res.send(err)
                } else {
                    // console.log(data);
                    let result = data[0]
                    res.render('admin/editProducts', { result });
                }
            })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    //deleting the category
    deleteCategory: (req, res, next) => {
        try {
            let proId = req.params.category
            productSchema.find({ category: proId }).then((result) => {
                if (result.length == 0) {
                    categorySchema.deleteOne({ category: proId }).then(() => {
                        res.json({ status: true })
                    })
                } else {
                    res.json({ status: false })
                }
            })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    //exception handling 404
    errorHandling: (req, res, next) => {
        try {
            res.render('admin/error-404');
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    // getting the category
    getadminCategory: (req, res, next) => {
        try {
            categorySchema.find({}, function (err, result) {
                if (err) {
                    res.send(err)
                } else {
                    res.render('admin/adminCategory', { result, errMsg, errorMsg });
                }
                errMsg = null;
            })
            errorMsg = null;
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    //adding a category
    postadminCategory: (req, res, next) => {
        try {
            req.body.category = req.body.category.toLowerCase();
            categorySchema.findOne({ category: req.body.category }).then((itexists) => {
                if (itexists) {
                    errMsg = "This category already exists"
                    res.redirect("/admin/adminCategory");
                } else {
                    const { category } = req.body;
                    const status = true;
                    const addcategory = new categorySchema({
                        category,
                        status
                    })
                    addcategory.save()
                    res.redirect('/admin/adminCategory')
                }
            })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    // to block user
    blockUser: async (req, res, next) => {
        try {
            let userId = req.params.id;
            await userSchema.updateOne({ _id: userId }, {
                $set: {
                    access: false
                }
            })
            res.redirect('/admin/userList');
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    //to unblock user
    unblockUser: async (req, res, next) => {
        try {
            let userId = req.params.id;
            await userSchema.updateOne({ _id: userId }, {
                $set: {
                    access: true
                }
            })
            res.redirect('/admin/userList');
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    //removing an product
    deleteProduct: (req, res, next) => {
        try {
            let productId = req.params.id
            productSchema.findOne({ _id: productId }).then((data) => {
                if (data.status) {
                    productSchema.updateOne({ _id: productId },
                        { $set: { status: false } }).then(() => {
                            res.json({ status: true })
                        })
                }
                else {
                    productSchema.updateOne({ _id: productId },
                        { $set: { status: true } }).then(() => {
                            res.json({ status: false })
                        })
                }
            }).catch((err) => {
                console.log(err);
            })
        }
        catch (err) {
            console.log(err);
            next(err)
        }
    },

    // post add products
    postaddProducts: (req, res, next) => {
        try {
            const image = [];
            // console.log(req.files);
            // console.log(req.body);
            for (file of req.files) {
                image.push(file.filename);
            }
            const { name, brand, quantity, category, price, description } = req.body;
            const status = true;

            const product = new productSchema({
                name,
                brand,
                quantity,
                category,
                price,
                description,
                image,
                status
            })
            product.save()
            res.redirect('/admin/productList');
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    // get add products
    getaddProducts: (req, res, next) => {
        try {
            categorySchema.find({}, function (err, result) {
                if (err) {
                    res.send(err)
                } else {
                    res.render('admin/addProducts', { result });
                }
            })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    //getting order details page
    orderDetails: async (req, res, next) => {
        try {
            const Order = await orderSchema.find({}).populate([
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
            res.render('admin/orderDetails', { Order: Order });
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    //listing the user
    userList: (req, res, next) => {
        try {
            userSchema.find({}, function (err, result) {
                if (err) {
                    res.send(err);
                } else {
                    // console.log(result)
                    res.render('admin/userList', { result });
                }
            })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    // lisitng the product
    productList: (req, res, next) => {
        try {
            productSchema.find({}, function (err, result) {
                // console.log(result);
                if (err) {
                    res.send(err);
                } else {
                    res.render('admin/productList', { result });
                }
            })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    adminHome: async (req, res, next) => {
        try {
            let Report = await orderSchema.find()
            // console.log(Report);
            let Orders = await orderSchema.find().count()
            let Users = await userSchema.find().count()
            let Product = await productSchema.find({ status: true }).count()
            let Placed = await orderSchema.find({ orderStatus: 'Order Placed' }).count()
            let Delivered = await orderSchema.find({ orderStatus: 'Delivered' }).count()
            let Cancelled = await orderSchema.find({ orderStatus: 'Cancelled' }).count()
            let Shipped = await orderSchema.find({ orderStatus: 'Shipped' }).count()
            let Sum = 0;
            for (let i = 0; i < Report.length; i++) {
                Sum = Sum + Report[i].total;
            }

            let incomeGenerated = await orderSchema.aggregate([
                // First Stage
                {
                    $match: { "date": { $ne: null } }
                },
                // Second Stage
                {
                    $group: {
                        _id: "$date",
                        sales: { $sum: "$total" },
                    }
                },
                // Third Stage
                {
                    $sort: { _id: 1 }
                },
                {
                    $limit: 7
                }
            ])
            console.log(incomeGenerated);
            const newArr = incomeGenerated.map(elements)
            function elements(item) {
                return item.sales;
            }
            // console.log(newArr);

            const newdate = incomeGenerated.map(dateOrder)
            function dateOrder(item) {
                return item._id;
            }

            res.render('admin/dashboard', { Report, Orders, Users, Product, Shipped, Delivered, Cancelled, newArr, newdate, Placed, Sum });
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    // get method of admin login
    getadminLogin: (req, res, next) => {
        try {
            if (req.session.adminloggedIn) {
                res.redirect('/admin');
            } else {
                res.render('admin/admin-login')
            }
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    // post method of admin login
    postAdminLogin: (req, res, next) => {
        try {
            adminSchema.findOne({ email: req.body.email }).then((admin) => {
                // console.log(admin);
                if (admin) {
                    bcrypt.compare(req.body.password, admin.password).then((data) => {

                        if (data) {
                            console.log('Admin Login Success');
                            req.session.admin = admin;
                            req.session.adminloggedIn = true;
                            res.redirect('/admin');
                        } else {
                            console.log('Login Failed');
                            res.redirect('/admin/admin-login');
                        }
                    })
                } else {
                    console.log('Login failed');
                    res.redirect('/admin/admin-login');
                }
            })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    adminLogout: (req, res, next) => {
        try {
            if (req.session.adminloggedIn) {
                req.session.adminloggedIn = false;
                req.session.destroy();
                res.redirect('/admin/admin-login');
            } else {
                res.redirect('/admin');
            }
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

};
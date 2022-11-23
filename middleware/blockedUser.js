const userSchema = require('../models/userModel')

module.exports = (req, res, next) => {
    try {
        if (req.session.loggedIn) {
            userData = req.session.user
            userSchema.findOne({ _id: userData._id }).then((user) => {
                if (user) {
                    if (user.access === true) {
                        next()
                    } else {
                        req.session.loggedIn = null;
                        res.redirect('/login');
                    }
                }
            })
        }

    } catch (err) {
        console.log(err);
        next(err)
    }
}

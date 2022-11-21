const { Router } = require('express');
const express = require('express');
const logger = require('morgan');
const path = require('path');
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const mongoose = require('./config/connection');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const Swal = require('sweetalert2');
const app = express();



app.use(express.json());
app.use(express.urlencoded({ extended: false }))

// // refreshing page
app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  next()
})

// Use the session middleware
app.use(session({
  saveUninitialized: true,
  resave: false,
  secret: 'my secret',
  cookie: { maxAge: 6000000 }
}))
app.use(cookieParser());

// User Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(__dirname + '/public/user/css'))
app.use('/img', express.static(__dirname + '/public/user/img'))
app.use('/js', express.static(__dirname + '/public/user/js'))
app.use('/fonts', express.static(__dirname + '/public/user/fonts'))
app.use('/scss', express.static(__dirname + '/public/user/scss'))

// Admin Static Files
app.use('/css', express.static(__dirname + '/public/admin/css'))
app.use('/images', express.static(__dirname + '/public/admin/images'))
app.use('/js', express.static(__dirname + '/public/admin/js'))
app.use('/fonts', express.static(__dirname + '/public/admin/fonts'))
app.use('/scss', express.static(__dirname + '/public/admin/scss'))
app.use('/docs', express.static(__dirname + '/public/admin/docs'))
app.use('/vendors', express.static(__dirname + '/public/admin/vendors'))

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Router setting
app.use('/admin', adminRouter);
app.use('/', usersRouter);

// Server connection
app.listen(3000);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.render('error/error-404', { status: '404' });
});

// error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.render('error/error-500', { status: '500' });
});


module.exports = app;
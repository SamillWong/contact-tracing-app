var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var axios = require('axios');

/*
 * GET admin dashboard page
 * Admins should be able to view all accessible routes.
 */
router.get('/', function (req, res) {
    return res.render('admin.ejs', { params: { verified: req.session.verified } });
    //return res.sendFile('admin.html', { root: 'views' });
});

/*
 * GET/POST admin register page
 * Admins should be able to sign up other admins.
 */
router.get('/register', function (req, res) {
    return res.sendFile('admin-register.html', { root: 'views' });
});

router.post('/register', function (req, res) {
    // TODO: Implement server-side
    return res.send("Success");
});

/*
 * GET/POST admin profile page
 * Logged-in admins should be able to view and edit their user information.
 */
router.get('/profile', function (req, res) {
    return res.sendFile('admin-profile.html', { root: 'views' });
});

router.post('/profile', function (req, res) {
    // TODO: Implement server-side
    return res.send("Success");
});

/*
 * GET/POST admin hotspot management page
 * Admins should be able to manage hotspots.
 */
router.get('/hotspots', function (req, res) {
    return res.sendFile('admin-hotspots.html', { root: 'views' });
});

router.post('/hotspots', function (req, res) {
    // TODO: Implement server-side
    return res.send("Success");
});

/*
 * GET/POST admin user management page
 * Admins should be able to manage users.
 */
router.get('/users', function (req, res) {
    return res.sendFile('admin-users.html', { root: 'views' });
});

router.post('/users', function (req, res) {
    // TODO: Implement server-side
    return res.send("Success");
});

/*
 * GET/POST admin venue management page
 * Admins should be able to manage venues.
 */
router.get('/venues', function (req, res) {
    return res.sendFile('admin-venues.html', { root: 'views' });
});

router.post('/venues', function (req, res) {
    // TODO: Implement server-side
    return res.send("Success");
});

module.exports = router;
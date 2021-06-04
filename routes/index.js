var express = require('express');
var router  = express.Router();
var bcrypt = require('bcryptjs');

/* GET home page */
router.get('/', function(req, res) {
  return res.sendFile('index.html', { root: 'views' });
});

/*
 * GET/POST login page
 * Users should be able to log in to their account.
 */
router.get('/login', function(req, res) {
  return res.sendFile('login.html', { root: 'views' });
});

router.post('/login', function(req, res) {
  // TODO: Add input validation and implement server-side
  return res.send("Success");
});

/*
 * GET/POST register page
 * Users should be able to register for an account.
 */
router.get('/register', function(req, res) {
  return res.sendFile('register.html', { root: 'views' });
});



/*
 * GET hotspots page
 * Users should be able to see current hotspots on a map.
 */
router.get('/hotspots', function(req, res) {
  return res.sendFile('hotspots.html', { root: 'views' });
});

/*
 * GET dashboard page
 * Logged-in users should be able to view all accessible routes.
 */
router.get('/dashboard', function(req, res) {
  return res.sendFile('dashboard.html', { root: 'views' });
});

/*
 * GET/POST check-in page
 * Logged-in users should be able to check-in by enter a code or scanning a QR code.
 */
router.get('/dashboard/check-in', function(req, res) {
  return res.sendFile('check-in.html', { root: 'views' });
});

router.post('/dashboard/check-in', function(req, res) {
  // TODO: Implement server-side
  return res.send("Success");
});

/*
 * GET check-in history page
 * Logged-in users should be able to see their check-in history on a map.
 */
router.get('/dashboard/check-in-history', function(req, res) {
  return res.sendFile('history.html', { root: 'views' });
});

/*
 * GET alerts page
 * Logged-in users should be able to see if they have been to a hotspot.
 */
router.get('/dashboard/alerts', function(req, res) {
  return res.sendFile('alerts.html', { root: 'views' });
});

/*
 * GET/POST profile page
 * Logged-in users should be able to view and edit their user information.
 */
router.get('/dashboard/profile', function(req, res) {
  return res.sendFile('profile.html', { root: 'views' });
});

router.post('/dashboard/profile', function(req, res) {
  // TODO: Implement server-side
  return res.send("Success");
});

/*
 * GET/POST venue page
 * Managers should be able to view and edit their venue information.
 */
router.get('/venue', function(req, res) {
  return res.sendFile('venue.html', { root: 'views' });
});

router.post('/venue', function(req, res) {
  // TODO: Implement server-side
  return res.send("Success");
});

/*
 * GET venue QR code page
 * Managers should be able to generate and view a QR code page for their venue.
 */
router.get('/venue/qr-code', function(req, res) {
  return res.sendFile('qr-code.html', { root: 'views' });
});

/*
 * GET/POST admin login page
 * Admins should be able to log in to their account.
 */
router.get('/admin-login', function(req, res) {
  return res.sendFile('admin-login.html', { root: 'views' });
});

router.post('/admin-login', function(req, res) {
  // TODO: Implement server-side
  return res.send("Success");
});

/*
 * GET admin dashboard page
 * Admins should be able to view all accessible routes.
 */
router.get('/admin', function(req, res) {
  return res.sendFile('admin.html', { root: 'views' });
});

/*
 * GET/POST admin register page
 * Admins should be able to sign up other admins.
 */
router.get('/admin/register', function(req, res) {
  return res.sendFile('admin-register.html', { root: 'views' });
});

router.post('/admin/register', function(req, res) {
  // TODO: Implement server-side
  return res.send("Success");
});

/*
 * GET/POST admin profile page
 * Logged-in admins should be able to view and edit their user information.
 */
router.get('/admin/profile', function(req, res) {
  return res.sendFile('admin-profile.html', { root: 'views' });
});

router.post('/admin/profile', function(req, res) {
  // TODO: Implement server-side
  return res.send("Success");
});

/*
 * GET/POST admin hotspot management page
 * Admins should be able to manage hotspots.
 */
router.get('/admin/hotspots', function(req, res) {
  return res.sendFile('admin-hotspots.html', { root: 'views' });
});

router.post('/admin/hotspots', function(req, res) {
  // TODO: Implement server-side
  return res.send("Success");
});

/*
 * GET/POST admin user management page
 * Admins should be able to manage users.
 */
router.get('/admin/users', function(req, res) {
  return res.sendFile('admin-users.html', { root: 'views' });
});

router.post('/admin/users', function(req, res) {
  // TODO: Implement server-side
  return res.send("Success");
});

/*
 * GET/POST admin venue management page
 * Admins should be able to manage venues.
 */
router.get('/admin/venues', function(req, res) {
  return res.sendFile('admin-venues.html', { root: 'views' });
});

router.post('/admin/venues', function(req, res) {
  // TODO: Implement server-side
  return res.send("Success");
});

module.exports = router;

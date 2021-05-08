var express = require('express');
var router  = express.Router();

/* GET home page */
router.get('/', function(req, res) {
  return res.sendFile('index.html', { root: 'views' });
});

/* GET login page */
router.get('/login', function(req, res) {
  return res.sendFile('login.html', { root: 'views' });
});

/* POST login page */
router.post('/login', function(req, res) {
  console.log(req.body);
  // TODO: Add input validation and implement server-side
  return res.send("Success");
});

/* GET register page */
router.get('/register', function(req, res) {
  return res.sendFile('register.html', { root: 'views' });
});

/* POST register page */
router.post('/register', function(req, res) {
  console.log(req.body);
  // TODO: Add input validation and implement server-side
  return res.send("Success");
});

/*
 * GET hotspots page
 * Users should be able to see current hotspots on a map.
 */
router.get('/hotspots', function(req, res) {
  return res.sendFile('hotspots.html', { root: 'views' });
});

/*
 * GET check-in page 
 * Logged-in users should be able to check-in by scanning a QR code.
 */
router.get('/dashboard/check-in', function(req, res) {
  return res.sendFile('check-in.html', { root: 'views' });
});

/*
 * POST check-in page 
 * Logged-in users should be able to check-in by entering a code.
 */
router.post('/dashboard/check-in', function(req, res) {
  console.log(req.body);
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
 * GET profile page 
 * Logged-in users should be able to view their user information.
 */
router.get('/dashboard/profile', function(req, res) {
  return res.sendFile('profile.html', { root: 'views' });
});

/*
 * POST profile page 
 * Logged-in users should be able to manage their user information.
 */
router.post('/dashbaord/profile', function(req, res) {
  console.log(req.body);
  // TODO: Implement server-side
  return res.send("Success");
});

/*
 * GET venue page 
 * Managers should be able to view their venue information.
 */
router.get('/venue', function(req, res) {
  return res.sendFile('venue.html', { root: 'views' });
});

/*
 * GET venue page 
 * Managers should be able to manage their venue information.
 */
router.post('/venue', function(req, res) {
  console.log(req.body);
  // TODO: Implement server-side
  return res.send("Success");
});

/*
 * GET venue check-in history page
 * Managers should be able to view the check-in history for their venue.
 */
router.get('/venue/check-in-history', function(req, res) {
  return res.sendFile('history.html', { root: 'views' });
});

/*
 * GET venue QR code page
 * Managers should be able to generate and view a QR code page for their venue.
 */
router.get('/venue/qr-code', function(req, res) {
  return res.sendFile('qr-code.html', { root: 'views' });
});

module.exports = router;

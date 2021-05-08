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

/* GET venue page */
router.get('/venue', function(req, res) {
  return res.sendFile('venue.html', { root: 'views' });
});

module.exports = router;

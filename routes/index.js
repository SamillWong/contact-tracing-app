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

/* GET venue page */
router.get('/venue', function(req, res) {
  return res.sendFile('venue.html', { root: 'views' });
});

module.exports = router;

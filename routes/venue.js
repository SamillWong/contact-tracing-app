var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var axios = require('axios');

/*
 * GET/POST venue page
 * Managers should be able to view and edit their venue information.
 */
router.get('/', function (req, res) {
    return res.render('venue.ejs', { params: { verified: req.session.verified } });
    //return res.sendFile('venue.html', { root: 'views' });
});

router.post('/', function (req, res) {
    // TODO: Implement server-side
    return res.send("Success");
});

/*
 * GET venue QR code page
 * Managers should be able to generate and view a QR code page for their venue.
 */
router.get('/qr-code', function (req, res) {
    return res.sendFile('qr-code.html', { root: 'views' });
});

module.exports = router;
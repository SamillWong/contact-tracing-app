var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var axios = require('axios');
var qrcode = require('qrcode');

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
router.get('/qr-code', async function (req, res) {
    const options = {
        width: 1000,
        height: 1000
    };
    var url = process.env.BASEURL+"/dashboard/check-in/"+req.session.managerid;
    var data = await qrcode.toDataURL(url, options);
    console.log(url);

    return res.render('qr-code.ejs', {
        params: {
            verified: req.session.verified,
            qrcode: data
        }
    });
    //return res.sendFile('qr-code.html', { root: 'views' });
});

module.exports = router;
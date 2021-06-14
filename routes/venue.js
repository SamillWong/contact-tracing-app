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
});

router.post('/edit', function (req, res) {
    const newDetails = {
        fname: req.body.fname,
        lname: req.body.lname,
        venuename: req.body.name,
        venueaddress: req.body.address
    }

    req.pool.getConnection(function (err, connection){

        if (err) {
            console.log("Error at req.pool.getConnection\n" + err);
            res.sendStatus(500);
            return;
        }
        var updateQuery = "UPDATE Venue INNER JOIN VenueManager ON Venue.VenueID = VenueManager.ManagerID SET Venue.Name = ?, Venue.Address = ?, VenueManager.FirstName = ?, VenueManager.LastName = ? WHERE VenueID = ?;";

        connection.query(updateQuery, [newDetails.venuename, newDetails.venueaddress, newDetails.fname, newDetails.lname, req.session.managerid], function (err,rows){
            if (err) {
                console.log("Error at connection.query(insert)\n" + err);
                res.sendStatus(500);
                return;
            }
        })
    })
    res.redirect('/venue');


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
});

module.exports = router;
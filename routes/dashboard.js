var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var axios = require('axios');

/*
 * GET dashboard page
 * Logged-in users should be able to view all accessible routes.
 */
router.get('/', function (req, res) {
    return res.render('dashboard.ejs', { params: { verified: req.session.verified } });
});

/*
 * GET/POST check-in page
 * Logged-in users should be able to check-in by enter a code or scanning a QR code.
 */
router.get('/check-in', function (req, res) {
    return res.render('check-in.ejs', { params: { verified: req.session.verified } });
});

router.post('/check-in', function (req, res) {

    var receivedcode = req.body.checkincode;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.log("Error at req.pool.getConnection\n" + err);
            res.sendStatus(500);
            return;
        }

        //Verify that the Checkin code matches an existing venue.
        var verifyvenueQuery = "SELECT * FROM Venue WHERE VenueID = ?;";

        connection.query(verifyvenueQuery, [receivedcode], async function (err, rows, fields) {
            if (err) {
                console.log("Error at req.pool.getConnection\n" + err);
                res.sendStatus(500);
                return;
            }

            // Venue does not exist, send error response.
            if (rows.length == 0) {
                connection.release();
                res.redirect('/dashboard/check-in');
            }
            // Venue exists, create a new check-in entry.
            else {
                var insertCheckIn = "INSERT INTO CheckIn (VenueID, UserID) VALUES (?, ?);";

                connection.query(insertCheckIn, [receivedcode, req.session.userid], async function (err, rows, fields) {
                    connection.release();
                    if (err) {
                        console.log("Error at insertCheckIn query\n" + err);
                        res.sendStatus(500);
                        return;
                    }
                    res.redirect('/profile');
                });
            }
        })
    });
});

router.get('/check-in/:code', function (req, res) {

    var receivedcode = req.params.code;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.log("Error at req.pool.getConnection\n" + err);
            res.sendStatus(500);
            return;
        }

        //Verify that the Checkin code matches an existing venue.
        var verifyvenueQuery = "SELECT * FROM Venue WHERE VenueID = ?;";

        connection.query(verifyvenueQuery, [receivedcode], async function (err, rows, fields) {
            if (err) {
                console.log("Error at req.pool.getConnection\n" + err);
                res.sendStatus(500);
                return;
            }

            // Venue does not exist, send error response.
            if (rows.length == 0) {
                connection.release();
                res.redirect('/dashboard/check-in');
            }
            // Venue exists, create a new check-in entry.
            else {
                var insertCheckIn = "INSERT INTO CheckIn (VenueID, UserID) VALUES (?, ?);";

                connection.query(insertCheckIn, [receivedcode, req.session.userid], async function (err, rows, fields) {
                    connection.release();
                    if (err) {
                        console.log("Error at insertCheckIn query\n" + err);
                        res.sendStatus(500);
                        return;
                    }
                    res.redirect('/profile');
                });
            }
        })
    });
});

/*
 * GET check-in history page
 * Logged-in users should be able to see their check-in history on a map.
 */
router.get('/check-in-history', function (req, res) {
    return res.sendFile('history.html', { root: 'views' });
});

/*GET next function
If user been to hotspot 14 days ago, go next function*/

router.get('/danger-users',function (req, res, next) {
    req.pool.getConnection(async function (err, connection) {
        if (err) {
            console.log("Error at req.pool.getConnection\n" + err);
            res.sendStatus(500);
            return;
        }

        var grapUserIDQuery = "SELECT CheckIn.UserID,CheckIn.VenueID FROM CheckIn INNER JOIN Hotspot ON CheckIn.VenueID = Hotspot.VenueID WHERE ((ABS(TIMESTAMPDIFF(DAY,Hotspot.Date,CheckIn.Date)) <= 14) OR (ABS(TIMESTAMPDIFF(SECOND,Hotspot.Date,CheckIn.Date)) <= 86400));"

        getPromise = (query, param) => {
            return new Promise((resolve, reject) => {
                connection.query(query, param, function (err, rows, fields) {
                    if (err) return reject(err);
                    return resolve(rows);
                });
            });
        }

        async function makeQuery() {
            try {
                const promises = [getPromise(grapUserIDQuery)];
                return await Promise.all(promises);
            } catch (err) {
                console.log(err);
            }
        }

        var result = await makeQuery();
        connection.release();

        for(var i=0; i<result[0][0].length; i++) {
                if(result[0][0][i].userid.indexOf(parseInt(req.session.userid,10))!=-1) {
                    next();
                }
        }
        res.sendStatus(200);
    });
});

/*
 * GET alerts page
 * Logged-in users should be able to see if they have been to a hotspot.
 */
router.get('/alerts', function (req, res) {
    return res.render('alerts.ejs', { params: { verified: req.session.verified } });
});

module.exports = router;
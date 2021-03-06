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
});

/*
 * GET/POST admin register page
 * Admins should be able to sign up other admins.
 */
router.get('/register', function (req, res) {
    return res.render('admin-register.ejs', { params: { verified: req.session.verified } });
});

router.post('/register', function (req, res) {
    const newUser = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        password: req.body.password
    };

    // Overwrite sent password with new hashed/salted password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newUser.password, salt);
    newUser.password = hash;

    req.pool.getConnection(function (err, connection) {

        if (err) {
            console.log("Error at req.pool.getConnection\n" + err);
            res.sendStatus(500);
            return;
        }

        var selectQuery = "SELECT Email FROM User WHERE Email = ? UNION SELECT Email FROM VenueManager WHERE Email = ? UNION SELECT Email FROM HealthOfficial WHERE Email = ?;";
        var insertQuery = "INSERT INTO HealthOfficial (Email, Password, FirstName, LastName) VALUES (?, ?, ?, ?);";

        getPromise = (query, param) => {
            return new Promise((resolve, reject) => {
                connection.query(query, param, function (err, rows) {
                    if (err) return reject(err);
                    return resolve(rows);
                })
            });
        }
        async function register() {
            try {
                var promises = [
                    getPromise(insertQuery, [newUser.email, newUser.password, newUser.fname, newUser.lname]),
                ];
                return await Promise.all(promises);
            } catch (err) {
                console.log(err);
            }
        }
        // Checks if email already exists
        connection.query(selectQuery, [newUser.email, newUser.email, newUser.email], async function (err, rows, fields) {
            if (err) {
                console.log("Error at connection.query(select)\n" + err);
                res.sendStatus(500);
                return;
            }
            // Email does not exist, register new account
            if (rows.length == 0) {
                await register();
            }
            connection.release();
            res.redirect('/admin');
        });
    });
});

/*
 * GET/POST admin hotspot management page
 * Admins should be able to manage hotspots.
 */
router.post('/hotspot/add', function (req, res) {

    var venueid = req.body.venueid;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.log("Error at req.pool.getConnection\n" + err);
            res.sendStatus(500);
            return;
        }

        // Verify that the venue exists.
        var selectQuery = "SELECT * FROM Venue WHERE VenueID = ?;";

        connection.query(selectQuery, [venueid], async function (err, rows, fields) {
            if (err) {
                console.log("Error at req.pool.getConnection\n" + err);
                res.sendStatus(500);
                return;
            }

            // Venue does not exist, send error response.
            if (rows.length == 0) {
                connection.release();
            }
            // Venue exists, create a new hotspot entry.
            else {
                var insertHotspot = "INSERT INTO Hotspot (VenueID) VALUES (?);";

                connection.query(insertHotspot, [venueid], async function (err, rows, fields) {
                    connection.release();
                    if (err) {
                        console.log("Error at insertCheckIn query\n" + err);
                        res.sendStatus(500);
                        return;
                    }
                });
            }
            res.redirect('/admin');
        })
    });
});

router.get('/hotspot/delete/:id', function (req, res) {

    var hotspotid = req.params.id;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.log("Error at req.pool.getConnection\n" + err);
            res.sendStatus(500);
            return;
        }

        // Verify that the hotspot code matches an existing hotspot.
        var selectQuery = "SELECT * FROM Hotspot WHERE HotspotID = ?;";

        connection.query(selectQuery, [hotspotid], async function (err, rows, fields) {
            if (err) {
                console.log("Error at selectQuery\n" + err);
                res.sendStatus(500);
                return;
            }

            // Hotspot does not exist, send error response.
            if (rows.length == 0) {
                connection.release();
            }
            // Hotspot exists, delete entry.
            else {
                var deleteQuery = "DELETE FROM Hotspot WHERE HotspotID = ?;";

                connection.query(deleteQuery, [hotspotid], async function (err, rows, fields) {
                    connection.release();
                    if (err) {
                        console.log("Error at deleteQuery\n" + err);
                        res.sendStatus(500);
                        return;
                    }
                });
            }
            res.redirect('/admin');
        })
    });
});

/*
 * GET/POST admin user management page
 * Admins should be able to manage users.
 */
router.get('/users', function (req, res) {

    if (req.query.name && req.query.name.length > 2) {

        req.pool.getConnection(async function (err, connection) {
            if (err) {
                res.sendStatus(500);
            }

            // Query the database with account ID and return a Promise object
            getPromise = (query, param) => {
                return new Promise((resolve, reject) => {
                    connection.query(query, param, function (err, rows, fields) {
                        if (err) return reject(err);
                        return resolve(rows);
                    });
                });
            }

            // Construct rows from each query
            async function makeQuery() {
                var profileQuery = "SELECT UserID, Email, FirstName, LastName, Address, ContactNumber FROM User WHERE (FirstName LIKE ? OR LastName LIKE ?);";
                try {
                    const promises = [getPromise(profileQuery, ['%'+req.query.name+'%', '%'+req.query.name+'%'])];
                    return await Promise.all(promises);
                } catch (err) {
                    console.log(err);
                }
            }
            var result = await makeQuery();
            connection.release();

            res.send(JSON.stringify(result[0]));
        });

    } else {
        return res.render('search.ejs', { params: { verified: req.session.verified, search: "users" } });
    }
});

/*
 * GET/POST profile page
 * Admins should be able to view and edit any user's information.
 */
router.get('/users/profile/:id', function (req, res) {
    return res.render('admin-profile.ejs', { params: { verified: req.session.verified } });
});

router.post('/users/profile/:id/edit', function (req, res) {
    const newDetails = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        address: req.body.address,
        contact: req.body.contact,
    }

    req.pool.getConnection(function (err, connection) {

        if (err) {
            console.log("Error at req.pool.getConnection\n" + err);
            res.sendStatus(500);
            return;
        }

        var updateQuery = "UPDATE User SET FirstName = ?, LastName = ?, Email = ?, Address = ?, ContactNumber = ? WHERE UserID = ?;";

        connection.query(updateQuery, [newDetails.fname, newDetails.lname, newDetails.email, newDetails.address, newDetails.contact, req.params.id], function (err, rows) {
            if (err) {
                console.log("Error at connection.query(insert)\n" + err);
                res.sendStatus(500);
                return;
            }
        })
    })
    res.redirect('/admin/users/profile/'+req.params.id);

});

/*
 * GET/POST admin venue management page
 * Admins should be able to manage venues.
 */
router.get('/venues', function (req, res) {

    if (req.query.name && req.query.name.length > 2) {

        req.pool.getConnection(async function (err, connection) {
            if (err) {
                res.sendStatus(500);
            }

            // Query the database with Email and return a Promise object
            getPromise = (query, param) => {
                return new Promise((resolve, reject) => {
                    connection.query(query, param, function (err, rows, fields) {
                        if (err) return reject(err);
                        return resolve(rows);
                    });
                });
            }

            // Construct rows from each query
            async function makeQuery() {
                var profileQuery = "SELECT VenueID, Name, Address, ContactNumber FROM Venue WHERE Name LIKE ?;";
                try {
                    const promises = [getPromise(profileQuery, ['%'+req.query.name+'%'])];
                    return await Promise.all(promises);
                } catch (err) {
                    console.log(err);
                }
            }
            var result = await makeQuery();
            connection.release();

            res.send(JSON.stringify(result[0]));
        });

    } else {
        return res.render('search.ejs', { params: { verified: req.session.verified, search: "venues" } });
    }

});

/*
 * GET/POST venue page
 * Admins should be able to view and edit any venue information.
 */
router.get('/venues/profile/:id', function (req, res) {
    return res.render('admin-venue.ejs', { params: { verified: req.session.verified } });
});

router.post('/venues/profile/:id/edit', function (req, res) {
    const newDetails = {
        fname: req.body.fname,
        lname: req.body.lname,
        venuename: req.body.name,
        venueaddress: req.body.address
    }

    req.pool.getConnection(function (err, connection) {

        if (err) {
            console.log("Error at req.pool.getConnection\n" + err);
            res.sendStatus(500);
            return;
        }

        var updateQuery = "UPDATE Venue INNER JOIN VenueManager ON Venue.VenueID = VenueManager.ManagerID SET Venue.Name = ?, Venue.Address = ?, VenueManager.FirstName = ?, VenueManager.LastName = ? WHERE VenueID = ?;";

        connection.query(updateQuery, [newDetails.venuename, newDetails.venueaddress, newDetails.fname, newDetails.lname, req.params.id], function (err, rows) {
            if (err) {
                console.log("Error at connection.query(insert)\n" + err);
                res.sendStatus(500);
                return;
            }
        })
    })
    res.redirect('/admin/venues/profile/'+req.params.id);

});

module.exports = router;
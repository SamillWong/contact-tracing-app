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

    const newUser = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email, // TODO: Make email case-insensitive
        password: req.body.password,
        type: req.body.type
    };
    newUser.type='healthofficial'

    // Overwrite sent password with new hashed/salted password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newUser.password, salt);
    newUser.password = hash;

    req.pool.getConnection(function(err, connection){

        var selectQuery = "SELECT Email FROM User WHERE Email=? UNION SELECT Email FROM VenueManager WHERE Email = ? UNION SELECT Email FROM HealthOfficial WHERE Email = ? ;";
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
                    getPromise(selectQuery, [newUser.email])
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
            // Email does not exist, register new account and log them in
            if (rows.length == 0) {
                var result = await register();
                connection.release();
                res.redirect('/admin');

            }
            // Email already exists in HealthOfficial, redirect to /login
            else {
                connection.release();
                res.redirect('/login');
            }
        });
    });
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
    return res.render('search.ejs', { params: { verified: req.session.verified } });
});

router.post('/users', function (req, res) {

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
            var profileQuery = "SELECT UserID, Email, FIrstName, LastName, Address, ContactNumber FROM User WHERE Email = ?;";
            try {
                const promises = [getPromise(profileQuery, [req.body.email])];
                return await Promise.all(promises);
            } catch (err) {
                console.log(err);
            }
        }
        var result = await makeQuery();
        connection.release();

        res.send(JSON.stringify(result[0][0]));
    });
});

/*
 * GET/POST admin venue management page
 * Admins should be able to manage venues.
 */
router.get('/venues', function (req, res) {
    return res.render('search.ejs', { params: { verified: req.session.verified } });
});

router.post('/venues', function (req, res) {

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
            var profileQuery = "SELECT VenueID, Name, Venue.Address, Longitude, Latitude, Venue.ContactNumber, ManagerID, Email, FirstName, LastName FROM Venue INNER JOIN VenueManager ON Venue.VenueID = VenueManager.ManagerID WHERE Email = ?;";
            try {
                const promises = [getPromise(profileQuery, [req.body.email])];
                return await Promise.all(promises);
            } catch (err) {
                console.log(err);
            }
        }
        var result = await makeQuery();
        connection.release();

        res.send(JSON.stringify(result[0][0]));
    });

});

module.exports = router;
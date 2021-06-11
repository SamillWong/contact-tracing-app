var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');

/* GET home page */
router.get('/', function (req, res) {
    return res.sendFile('index.html', { root: 'views' });
});

/*
 * GET/POST login page
 * Users should be able to log in to their account.
 */
router.get('/login', function (req, res) {
    return res.sendFile('login.html', { root: 'views' });
});

// Regular login
router.post('/login', function (req, res, next) {
    // TODO: Add input validation and implement server-side
    var returningUser = {
        email: req.body.email, // TODO: Make email case-insensitive
        password: req.body.password
    }

    req.pool.getConnection(async function (err, connection) {
        if (err) {
            res.sendStatus(500);
        }

        // Query the database with provided email address and return a Promise object
        getPromise = (query) => {
            return new Promise((resolve, reject) => {
                connection.query(query, [returningUser.email], function (err, rows) {
                    if (err) return reject(err);
                    return resolve(rows);
                });
            });
        }

        // Construct rows from each query
        async function makeQuery() {
            const userQuery = "SELECT * FROM User WHERE Email = ?;";
            const managerQuery = "SELECT * FROM VenueManager WHERE Email = ?;";
            const officialQuery = "SELECT * FROM HealthOfficial WHERE Email = ?;";
            try {
                const promises = [getPromise(userQuery), getPromise(managerQuery), getPromise(officialQuery)];
                return await Promise.all(promises);
            } catch (err) {
                console.log(err);
            }
        }
        var result = await makeQuery();
        connection.release();

        // Loop through each account type and compare password hash
        for (let i = 0; i < 3; i++) {
            if (result[i].length) {
                var isMatch = bcrypt.compareSync(returningUser.password, result[i][0].Password);
                if (isMatch) {
                    req.session.verified = i + 1;
                    switch (i) {
                        case 0: req.session.userid = result[i][0].UserID; break;
                        case 1: req.session.managerid = result[i][0].ManagerID; break;
                        case 2: req.session.healthofficalid = result[i][0].HealthOfficialID; break;
                    }
                    res.redirect('/dashboard/profile');
                } else {
                    res.redirect("/login");
                }
                break;
            } else if (i == 2) {
                res.redirect("/login");
            }
        }
    });
});

/*
 * GET logout page
 * Users should be able to log out of their account.
 */
router.get('/logout', function (req, res) {
    req.session.destroy();
    return res.redirect('/');
});

/*
 * GET/POST register page
 * Users should be able to register for an account.
 */
router.get('/register', function (req, res) {
    return res.sendFile('register.html', { root: 'views' });
});

// Account registration
router.post('/register', function (req, res, next) {

    // Object to store user values
    const newUser = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email, // TODO: Make email case-insensitive
        password: req.body.password,
        venuename: req.body.venuename,
        address: req.body.address,
        suburb: req.body.suburb,
        type: req.body.type
    }

    // Overwrite sent password with new hashed/salted password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newUser.password, salt);
    newUser.password = hash;

    // Longitude and Latitude calculations
    var splitaddress = newUser.address.split(" ");
    var addresslength = splitaddress.length
    var geocodequery = "/https://maps.googleapis.com/maps/api/geocode/json?address="

    for (let i = 0; i < addresslength; i++) {
        geocodequery += splitaddress[i];
        geocodequery += '+'
    }

    // Complete geocode query
    geocodequery += ",+" + newUser.suburb + ",+SA&key=AIzaSyD0Rnjk-r6Ezi8olChd6eQfpVAgrPh6NXE";
    //console.log(geocodequery);

    req.pool.getConnection(function (err, connection) {

        if (err) {
            console.log("Error at req.pool.getConnection\n" + err);
            res.sendStatus(500);
            return;
        }

        // Venue manager selected
        if (newUser.type == "manager") {
            var selectQuery = "SELECT * FROM VenueManager WHERE Email = ?;";
            var insertQuery = "INSERT INTO VenueManager (Email, Password, FirstName, LastName) VALUES (?, ?, ?, ?);";
            // TODO: Placeholders at (1, 1). Will be replaced with longitude and latitude.
            var venueInsertQuery = "INSERT INTO Venue (Name, Address, Longitude, Latitude) VALUES (?, ?, 1, 1);";
        }
        // User selected (default)
        else {
            var selectQuery = "SELECT * FROM User WHERE Email = ?;";
            var insertQuery = "INSERT INTO User (Email, Password, FirstName, LastName) VALUES (?, ?, ?, ?);";
        }

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
                if (newUser.type == "manager") {
                    var promises = [
                        getPromise(insertQuery, [newUser.email, newUser.password, newUser.fname, newUser.lname]),
                        getPromise(venueInsertQuery, [newUser.venuename, newUser.address]),
                        getPromise(selectQuery, [newUser.email])
                    ];
                } else {
                    var promises = [
                        getPromise(insertQuery, [newUser.email, newUser.password, newUser.fname, newUser.lname]),
                        getPromise(selectQuery, [newUser.email])
                    ];
                }
                return await Promise.all(promises);
            } catch (err) {
                console.log(err);
            }
        }

        // Checks if email already exists
        connection.query(selectQuery, [newUser.email], async function (err, rows, fields) {
            if (err) {
                console.log("Error at connection.query(select)\n" + err);
                res.sendStatus(500);
                return;
            }

            // Email does not exist, register new account and log them in
            if (rows.length == 0) {
                var result = await register();
                connection.release();
                // Account belongs to a manager, redirect to venue page
                if (newUser.type == "manager") {
                    req.session.verified = 2;
                    req.session.managerid = result[2][0].ManagerID;
                    res.redirect('/venue');
                }
                // Account belongs to a user, redirect to profile page
                else {
                    req.session.verified = 1;
                    req.session.userid = result[1][0].UserID;
                    res.redirect('/dashboard/profile');
                }
            }
            // Email already exists, redirect to /login
            else {
                connection.release();
                res.redirect('/login');
            }
        });
    });
});

/*
 * GET hotspots page
 * Users should be able to see current hotspots on a map.
 */
router.get('/hotspots', function (req, res) {
    return res.sendFile('hotspots.html', { root: 'views' });
});

/*
 * GET dashboard page
 * Logged-in users should be able to view all accessible routes.
 */
router.get('/dashboard', function (req, res) {
    return res.sendFile('dashboard.html', { root: 'views' });
});

/*
 * GET/POST check-in page
 * Logged-in users should be able to check-in by enter a code or scanning a QR code.
 */
router.get('/dashboard/check-in', function (req, res) {
    return res.sendFile('check-in.html', { root: 'views' });
});

router.post('/dashboard/check-in', function (req, res) {

    var receivedcode=req.body.checkincode;

    req.pool.getConnection(function (err, connection){
        if (err) {
            console.log("Error at req.pool.getConnection\n" + err);
            res.sendStatus(500);
            return;
        }

        //Verify that the Checkin code matches an existing venue.
        var verifyvenueQuery = "SELECT * FROM Venue WHERE VenueID = ?;";

        connection.query(verifyvenueQuery, [receivedcode], async function (err, rows, fields){
            if (err) {
                console.log("Error at req.pool.getConnection\n" + err);
                res.sendStatus(500);
                return;
            }

            if (rows.length==0){ //Venue does not exist send error.
                connection.release();
                res.redirect('/dashboard/check-in');
            } else { //Venue does exist. Create Checkin entry.
                var insertCheckIn= "INSERT INTO CheckIn (VenueID, Date, UserID) VALUES (?, ?, ?);";

                var timecalc= new Date();
                var timeanddate="";
                timeanddate+=timecalc.toLocaleDateString();
                timeanddate+=" " + timecalc.toLocaleTimeString(); //TODO: For some reason this is giving GMT time despite it being localeString. Unsure of solution. May be different per system. Can just accept GMT and remove "+0930" 1 line down
                timeanddate+=" GMT+0930" //Time and Data finalised here. Format:  6/11/2021 10:47:21 AM GMT+0930

                //console.log(timeanddate);

                connection.query(insertCheckIn, [receivedcode, timeanddate, req.session.userid], async function (err, rows, fields){
                    connection.release();
                    if (err) {
                        console.log("Error at insertCheckIn query\n" + err);
                        res.sendStatus(500);
                        return;
                    } else {
                        res.redirect('/dashboard/profile');
                    }
                });
            }
        })
    });
});

/*
 * GET check-in history page
 * Logged-in users should be able to see their check-in history on a map.
 */
router.get('/dashboard/check-in-history', function (req, res) {
    return res.sendFile('history.html', { root: 'views' });
});

/*
 * GET alerts page
 * Logged-in users should be able to see if they have been to a hotspot.
 */
router.get('/dashboard/alerts', function (req, res) {
    return res.sendFile('alerts.html', { root: 'views' });
});

/*
 * GET/POST profile page
 * Logged-in users should be able to view and edit their user information.
 */
router.get('/dashboard/profile', function (req, res) {
    return res.sendFile('profile.html', { root: 'views' });
});

router.post('/dashboard/profile', function (req, res) {
    // TODO: Implement server-side
    return res.send("Success");
});

/*
 * GET/POST venue page
 * Managers should be able to view and edit their venue information.
 */
router.get('/venue', function (req, res) {
    return res.sendFile('venue.html', { root: 'views' });
});

router.post('/venue', function (req, res) {
    // TODO: Implement server-side
    return res.send("Success");
});

/*
 * GET venue QR code page
 * Managers should be able to generate and view a QR code page for their venue.
 */
router.get('/venue/qr-code', function (req, res) {
    return res.sendFile('qr-code.html', { root: 'views' });
});

/*
 * GET/POST admin login page
 * Admins should be able to log in to their account.
 */
router.get('/admin-login', function (req, res) {
    return res.sendFile('admin-login.html', { root: 'views' });
});

router.post('/admin-login', function (req, res) {
    // TODO: Implement server-side
    return res.send("Success");
});

/*
 * GET admin dashboard page
 * Admins should be able to view all accessible routes.
 */
router.get('/admin', function (req, res) {
    return res.sendFile('admin.html', { root: 'views' });
});

/*
 * GET/POST admin register page
 * Admins should be able to sign up other admins.
 */
router.get('/admin/register', function (req, res) {
    return res.sendFile('admin-register.html', { root: 'views' });
});

router.post('/admin/register', function (req, res) {
    // TODO: Implement server-side
    return res.send("Success");
});

/*
 * GET/POST admin profile page
 * Logged-in admins should be able to view and edit their user information.
 */
router.get('/admin/profile', function (req, res) {
    return res.sendFile('admin-profile.html', { root: 'views' });
});

router.post('/admin/profile', function (req, res) {
    // TODO: Implement server-side
    return res.send("Success");
});

/*
 * GET/POST admin hotspot management page
 * Admins should be able to manage hotspots.
 */
router.get('/admin/hotspots', function (req, res) {
    return res.sendFile('admin-hotspots.html', { root: 'views' });
});

router.post('/admin/hotspots', function (req, res) {
    // TODO: Implement server-side
    return res.send("Success");
});

/*
 * GET/POST admin user management page
 * Admins should be able to manage users.
 */
router.get('/admin/users', function (req, res) {
    return res.sendFile('admin-users.html', { root: 'views' });
});

router.post('/admin/users', function (req, res) {
    // TODO: Implement server-side
    return res.send("Success");
});

/*
 * GET/POST admin venue management page
 * Admins should be able to manage venues.
 */
router.get('/admin/venues', function (req, res) {
    return res.sendFile('admin-venues.html', { root: 'views' });
});

router.post('/admin/venues', function (req, res) {
    // TODO: Implement server-side
    return res.send("Success");
});

module.exports = router;

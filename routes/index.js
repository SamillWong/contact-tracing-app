var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var axios = require('axios');

/* GET home page */
router.get('/', function (req, res) {
    return res.render('index.ejs', { params: { verified: req.session.verified } });
    // return res.sendFile('index.html', { root: 'views' });
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
                        case 0:
                            req.session.userid = result[i][0].UserID;
                            res.redirect('/profile');
                            break;
                        case 1:
                            req.session.managerid = result[i][0].ManagerID;
                            res.redirect('/venue');
                            break;
                        case 2:
                            req.session.healthofficalid = result[i][0].HealthOfficialID;
                            res.redirect('/admin');
                            break;
                        default:
                            res.redirect('/login')
                    }
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

// Returns latitude and longtitude
async function getLat(givenaddress) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: givenaddress,
                key: process.env.MAP_API_KEY
            }
        });
        var newLatitude = response.data.results[0].geometry.location.lat;
        return await newLatitude;
    } catch (error) {
        console.log(error);
    }
}

async function getLong(givenaddress) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: givenaddress,
                key: process.env.MAP_API_KEY
            }
        });
        var newLongitude = response.data.results[0].geometry.location.lng;
        return await newLongitude;
    } catch (error) {
        console.log(error);
    }
}

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

    // Longitude and Latitude calculations address details
    var splitaddress = newUser.address.split(" ");
    var addresslength = splitaddress.length
    var fulladdress = "";

    for (let i = 0; i < addresslength; i++) {
        fulladdress += splitaddress[i];
        fulladdress += '+'
    }
    fulladdress += ",+" + newUser.suburb + ",+SA";

    //Query database and insert if neccessary.
    req.pool.getConnection(function (err, connection) {

        if (err) {
            console.log("Error at req.pool.getConnection\n" + err);
            res.sendStatus(500);
            return;
        }

        // Venue manager selected
        if (newUser.type == "manager") {
            var selectQuery = "SELECT ManagerID FROM VenueManager WHERE Email = ? UNION SELECT Email FROM User WHERE Email = ? UNION SELECT Email FROM HealthOfficial WHERE Email = ? ;";
            var insertQuery = "INSERT INTO VenueManager (Email, Password, FirstName, LastName) VALUES (?, ?, ?, ?);";
            var venueInsertQuery = "INSERT INTO Venue (Name, Address, Latitude, Longitude) VALUES (?, ?, ?, ?);";
        }
        // User selected (default)
        else {
            var selectQuery = "SELECT UserID FROM User WHERE Email = ? UNION SELECT Email FROM VenueManager WHERE Email = ? UNION SELECT Email FROM HealthOfficial WHERE Email = ? ;";
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
                        getPromise(venueInsertQuery, [newUser.venuename, newUser.address, await getLat(fulladdress), await getLong(fulladdress)]),
                        getPromise(selectQuery, [newUser.email, newUser.email, newUser.email])
                    ];
                } else {
                    var promises = [
                        getPromise(insertQuery, [newUser.email, newUser.password, newUser.fname, newUser.lname]),
                        getPromise(selectQuery, [newUser.email, newUser.email, newUser.email])
                    ];
                }
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
                // Account belongs to a manager, redirect to venue page
                if (newUser.type == "manager") {
                    req.session.verified = 2;
                    req.session.managerid = result[2][0].ManagerID;
                    res.redirect('/venue');
                }
                // Account belongs to a user, redirect to profile page
                else {
                    req.session.verified = 1;
                    console.log(result[1][0].UserID);
                    req.session.userid = result[1][0].UserID;
                    res.redirect('/profile');
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
    return res.render('hotspots.ejs', { params: { verified: req.session.verified } });
    //return res.sendFile('hotspots.html', { root: 'views' });
});

/*
 * GET/POST profile page
 * Logged-in users should be able to view and edit their user information.
 */
router.get('/profile', function (req, res) {
    return res.render('profile.ejs', { params: { verified: req.session.verified } });
    //return res.sendFile('profile.html', { root: 'views' });
});

router.post('/profile', function (req, res) {
    // TODO: Implement server-side
    return res.send("Success");
});

module.exports = router;

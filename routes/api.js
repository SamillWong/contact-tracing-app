var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var app = express();
var expressValidator = require('express-validator');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

/* Endpoint for getting profile details */
router.get('/profile', function (req, res, next) {

    if (req.session.verified != 1 && req.session.verified != 2 && req.session.verified != 3) {
        return res.sendStatus(401);
    }

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
            switch (req.session.verified) {
                case 1:
                    var profileQuery = "SELECT FirstName, LastName, Email, Address, ContactNumber FROM User WHERE UserID = ?;";
                    var accountid = req.session.userid;
                    break;
                case 2:
                    var profileQuery = "SELECT FirstName, LastName, Email, Address, ContactNumber FROM VenueManager WHERE ManagerID = ?;";
                    var accountid = req.session.managerid;
                    break;
                case 3:
                    var profileQuery = "SELECT FirstName, LastName, Email, Address, ContactNumber FROM HealthOfficial WHERE HealthOfficialID = ?;";
                    var accountid = req.session.healthofficialid;
                    break;
            }
            try {
                const promises = [getPromise(profileQuery, [accountid])];
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

/* Endpoint for getting profile details of another user */
router.get('/profile/:type/:id', function (req, res, next) {

    if (req.session.verified != 3) {
        return res.sendStatus(401);
    }

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
            switch (parseInt(req.params.type)) {
                case 1: var profileQuery = "SELECT UserID, FirstName, LastName, Email, Address, ContactNumber FROM User WHERE UserID = ?;"; break;
                case 2: var profileQuery = "SELECT ManagerID, FirstName, LastName, Email, Address, ContactNumber FROM VenueManager WHERE ManagerID = ?;"; break;
                case 3: var profileQuery = "SELECT HealthOfficialID, FirstName, LastName, Email, Address, ContactNumber FROM HealthOfficial WHERE HealthOfficialID = ?;"; break;
            }
            try {
                const promises = [getPromise(profileQuery, [req.params.id])];
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

/* Endpoint for getting check-in entries */
router.get('/check-in', function (req, res, next) {

    if (req.session.verified != 1 && req.session.verified != 2) {
        return res.sendStatus(401);
    }

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
            switch (req.session.verified) {
                case 1:
                    var checkInQuery = "SELECT CheckIn.CheckInID, CheckIn.Date, Venue.Name, Venue.Address FROM CheckIn INNER JOIN Venue ON Venue.VenueID=CheckIn.VenueID WHERE CheckIn.UserID = ? ORDER BY CheckIn.CheckInID;";
                    var accountid = req.session.userid;
                    break;
                case 2:
                    var checkInQuery = "SELECT CheckIn.CheckInID, CheckIn.Date, User.FirstName, User.LastName FROM CheckIn INNER JOIN User ON CheckIn.UserID = User.UserID WHERE CheckIn.VenueID = ? ORDER BY CheckIn.CheckInID;";
                    var accountid = req.session.managerid;
                    break;
            }
            try {
                const promises = [getPromise(checkInQuery, accountid)];
                return await Promise.all(promises);
            } catch (err) {
                console.log(err);
            }
        }
        var result = await makeQuery();
        connection.release();

        res.send(JSON.stringify(result[0]));
    });
});

/* Endpoint for getting check-in entries for a user or venue */
router.get('/check-in/:type/:id', function (req, res, next) {

    if (req.session.verified != 3) {
        return res.sendStatus(401);
    }

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
            switch (parseInt(req.params.type)) {
                case 1:
                    var checkInQuery = "SELECT CheckIn.CheckInID, CheckIn.Date, Venue.Name, Venue.Address FROM CheckIn INNER JOIN Venue ON Venue.VenueID=CheckIn.VenueID WHERE CheckIn.UserID = ? ORDER BY CheckIn.CheckInID;"; break;
                case 2:
                    var checkInQuery = "SELECT CheckIn.CheckInID, CheckIn.Date, User.FirstName, User.LastName FROM CheckIn INNER JOIN User ON CheckIn.UserID = User.UserID WHERE CheckIn.VenueID = ? ORDER BY CheckIn.CheckInID;"; break;
            }
            try {
                const promises = [getPromise(checkInQuery, req.params.id)];
                return await Promise.all(promises);
            } catch (err) {
                console.log(err);
            }
        }
        var result = await makeQuery();
        connection.release();

        res.send(JSON.stringify(result[0]));
    });
});


/* Endpoint for getting hotspot entries */
router.get('/hotspot', function (req, res, next) {

    req.pool.getConnection(async function (err, connection) {
        if (err) {
            res.sendStatus(500);
        }

        // Query the database for hotspots and return a Promise object
        getPromise = (query) => {
            return new Promise((resolve, reject) => {
                connection.query(query, function (err, rows, fields) {
                    if (err) return reject(err);
                    return resolve(rows);
                });
            });
        }

        // Construct rows from query
        async function makeQuery() {
            var checkInQuery = "SELECT Hotspot.HotspotID, Hotspot.Date, Venue.Name, Venue.Address, Venue.VenueID FROM Hotspot INNER JOIN Venue ON Hotspot.VenueID = Venue.VenueID ORDER BY Hotspot.HotspotID;";
            try {
                const promises = [getPromise(checkInQuery)];
                return await Promise.all(promises);
            } catch (err) {
                console.log(err);
            }
        }
        var result = await makeQuery();
        connection.release();

        res.send(JSON.stringify(result[0]));
    });
});

/* Endpoint for getting user alert entries */
router.get('/alert', function (req, res, next) {

    if (req.session.verified != 1) {
        return res.sendStatus(401);
    }

    req.pool.getConnection(async function (err, connection) {
        if (err) {
            res.sendStatus(500);
        }

        // Query the database for alerts and return a Promise object
        getPromise = (query, param) => {
            return new Promise((resolve, reject) => {
                connection.query(query, param, function (err, rows, fields) {
                    if (err) return reject(err);
                    return resolve(rows);
                });
            });
        }

        // Construct rows from query
        async function makeQuery() {
            var alertQuery = "SELECT Hotspot.HotspotID, CheckIn.Date, Venue.Name, Venue.Address FROM CheckIn INNER JOIN Hotspot ON CheckIn.VenueID = Hotspot.VenueID INNER JOIN Venue ON CheckIn.VenueID = Venue.VenueID WHERE (((ABS(TIMESTAMPDIFF(DAY,Hotspot.Date,CheckIn.Date)) <= 14) OR (ABS(TIMESTAMPDIFF(SECOND,Hotspot.Date,CheckIn.Date)) <= 86400))) AND CheckIn.UserID = ?;";
            try {
                const promises = [getPromise(alertQuery, req.session.userid)];
                return await Promise.all(promises);
            } catch (err) {
                console.log(err);
            }
        }
        var result = await makeQuery();
        connection.release();

        res.send(JSON.stringify(result[0]));
    });
});

/* Endpoint for getting venue profile details */
router.get('/venue', function (req, res, next) {

    if (req.session.verified != 2) {
        return res.sendStatus(401);
    }

    req.pool.getConnection(async function (err, connection) {
        if (err) {
            res.sendStatus(500);
        }

        // Query the database with provided ManagerID and return a Promise object
        getPromise = (query) => {
            return new Promise((resolve, reject) => {
                connection.query(query, [req.session.managerid], function (err, rows, fields) {
                    if (err) return reject(err);
                    return resolve(rows);
                });
            });
        }

        // Construct rows from each query
        async function makeQuery() {
            const venueQuery = "SELECT Venue.Name, Venue.Address, VenueManager.FirstName, VenueManager.LastName FROM Venue INNER JOIN VenueManager ON Venue.VenueID = VenueManager.ManagerID WHERE ManagerID = ?;";
            try {
                const promises = [getPromise(venueQuery)];
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

/* Endpoint for getting profile details of another user */
router.get('/venue/:id', function (req, res, next) {

    if (req.session.verified != 3) {
        return res.sendStatus(401);
    }

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
            var venueQuery = "SELECT Venue.VenueID, Venue.Name, Venue.Address, VenueManager.FirstName, VenueManager.LastName FROM Venue INNER JOIN VenueManager ON Venue.VenueID = VenueManager.ManagerID WHERE VenueID = ?;";
            try {
                const promises = [getPromise(venueQuery, [req.params.id])];
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
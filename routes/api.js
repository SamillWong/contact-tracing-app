var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var app = express();
var expressValidator = require('express-validator');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

/* Endpoint for getting profile details */
router.get('/profile', function (req, res, next) {

    if (req.session.verified != 1) {
        return res.sendStatus(401);
    }

    req.pool.getConnection(async function (err, connection) {
        if (err) {
            res.sendStatus(500);
        }

        // Query the database with UserID and return a Promise object
        getPromise = (query) => {
            return new Promise((resolve, reject) => {
                connection.query(query, [req.session.userid], function (err, rows, fields) {
                    if (err) return reject(err);
                    return resolve(rows);
                });
            });
        }

        // Construct rows from each query
        async function makeQuery() {
            const userQuery = "SELECT User.FirstName, User.LastName, User.Email, User.Address, User.ContactNumber FROM User WHERE UserID = ?;";
            try {
                const promises = [getPromise(userQuery)];
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

    if (req.session.verified != 1) {
        return res.sendStatus(401);
    }

    req.pool.getConnection(async function (err, connection) {
        if (err) {
            res.sendStatus(500);
        }

        // Query the database with provided email address and return a Promise object
        getPromise = (query) => {
            return new Promise((resolve, reject) => {
                connection.query(query, [req.session.userid], function (err, rows, fields) {
                    if (err) return reject(err);
                    return resolve(rows);
                });
            });
        }

        // Construct rows from each query
        async function makeQuery() {
            const query = "SELECT CheckIn.CheckInID, CheckIn.Date, Venue.Name, Venue.Address FROM CheckIn INNER JOIN Venue ON Venue.VenueID=CheckIn.VenueID WHERE CheckIn.UserID = ? ORDER BY CheckIn.CheckInID;";
            try {
                const promises = [getPromise(query)];
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

module.exports = router;
var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var app = express();
var expressValidator = require('express-validator');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

var bcrypt = require('bcryptjs');

// Google OAuth2 init
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

// Google OAuth2 login
router.post('/token', function (req, res, next) {

    if ('user' in req.body) {
        if (req.body.user in users) {
            if (users[req.body.user] === req.body.pass) {
                req.session.user = req.body.user;
                res.send(req.session.user);
            } else {
                res.sendStatus(401);
            }
        } else {
            res.sendStatus(401);
        }
    }
    else if ('token' in req.body) {
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken: req.body.token,
                audience: process.env.CLIENT_ID
            });
            const payload = ticket.getPayload();
            req.session.user = payload['email'];
            res.send(req.session.user);
        }
        verify().catch(function () { res.sendStatus(401); });
    }
});

// Google OAuth2 verify
router.post('/verify', function (req, res, next) {

    req.pool.getConnection(async function (err, connection) {
        if (err) {
            res.sendStatus(500);
        }

        // Query the database with provided email address and return a Promise object
        getPromise = (query) => {
            return new Promise((resolve, reject) => {
                connection.query(query, [req.body.user], function (err, rows, fields) {
                    if (err) {
                        return reject(err);
                    }
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
                res.sendStatus(500);
            }
        }
        var result = await makeQuery();
        connection.release();

        // Loop through each account type and compare password hash
        for (let i = 0; i < 3; i++) {
            if (result[i].length) {
                req.session.verified = i + 1;
                switch (i) {
                    case 0: req.session.userid = result[i][0].UserID; break;
                    case 1: req.session.managerid = result[i][0].ManagerID; break;
                    case 2: req.session.healthofficalid = result[i][0].HealthOfficialID; break;
                }
                res.sendStatus(200);
                break;
            } else if (i == 2) {
                res.sendStatus(500);
            }
        }
    });
});

module.exports = router;
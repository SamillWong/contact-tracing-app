// TODO: Merge router file with index.js
var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var app = express();
var expressValidator = require('express-validator');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

var bcrypt = require('bcryptjs');

// Google OAuth2 init
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

// TODO: Rename endpoint with appropriate name
// Google OAuth2 login
router.post('/login', function(req, res, next) {

    if ('user' in req.body) {
        if (req.body.user in users) {
            if(users[req.body.user] === req.body.pass) {
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
              audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
              // Or, if multiple clients access the backend:
              //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
          });
          const payload = ticket.getPayload();
          req.session.user = payload['email'];
          res.send(req.session.user);

          // If request specified a G Suite domain:
          // const domain = payload['hd'];
        }
        verify().catch(function(){res.sendStatus(401);});
    }
});

// TODO: Rename endpoint to /auth
// Google OAuth2 verify
router.post('/login/verifyDB', function(req,res,next) {

    req.pool.getConnection(async function(err, connection) {
        if (err) {
            res.sendStatus(500);
        }

        // Query the database with provided email address and return a Promise object
        getPromise = (query) => {
            return new Promise((resolve, reject) => {
                connection.query(query, [req.body.user], function(err,rows,fields) {
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
                req.session.verified = true;
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

// Account registration
router.post('/register', function(req, res, next) {

    // Object to store user values
    const newUser = {
                        fname: req.body.fname,
                        lname: req.body.lname,
                        email: req.body.email, // TODO: Make email case-insensitive
                        password: req.body.password,
                        type:req.body.type,
                    }

    // Overwrite sent password with new hashed/salted password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newUser.password, salt);
    newUser.password = hash;

    req.pool.getConnection(function(err, connection) {

        if (err) {
            console.log("Error at req.pool.getConnection");
            res.sendStatus(500);
            return;
        }

        // Venue manager selected
        if (newUser.type == "manager") {
            var selectQuery = "SELECT * FROM VenueManager WHERE Email = ?;";
            var insertQuery = "INSERT INTO VenueManager (Email, Password, FirstName, LastName) VALUES (?, ?, ?, ?);";
        }
        // User selected (default)
        else {
            var selectQuery = "SELECT * FROM User WHERE Email = ?;";
            var insertQuery = "INSERT INTO User (Email, Password, FirstName, LastName) VALUES (?, ?, ?, ?);";
        }

        // Check if email exists in database. If not, create new entry.
        connection.query(selectQuery, [newUser.email], function(err,rows,fields) {

            if (err) {
                console.log("Error at connection.query(select)\n"+err);
                res.sendStatus(500);
                return;
            }

            // Account does not exist. Create a new account using provided data.
            if (rows.length == 0) {
                connection.query(insertQuery, [newUser.email, newUser.password, newUser.fname, newUser.lname], function(err,rows,fields) {
                    connection.release();
                    if (err) {
                        console.log("Error at connection.query(insert)");
                        res.sendStatus(500);
                        return;
                    }
                    res.redirect('/');  // TODO: Auto-login user
                });
            }
            // Account already exists. Redirect user to /login.
            else {
                connection.release();
                res.redirect("/login");
            }
        });
    });
});

// TODO: Rename endpoint to /login
// Regular login
router.post('/regular-login', function(req, res, next) {
    // TODO: Add input validation and implement server-side
    var returningUser = {
        email: req.body.email, // TODO: Make email case-insensitive
        password: req.body.password
    }

    req.pool.getConnection(async function(err, connection) {
        if (err) {
            res.sendStatus(500);
        }

        // Query the database with provided email address and return a Promise object
        getPromise = (query) => {
            return new Promise((resolve, reject) => {
                connection.query(query, [returningUser.email], function(err,rows,fields) {
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
            }
        }
        var result = await makeQuery();
        connection.release();

        // Loop through each account type and compare password hash
        for (let i = 0; i < 3; i++) {
            if (result[i].length) {
                var isMatch = bcrypt.compareSync(returningUser.password, result[i][0].Password);
                if (isMatch) {
                    req.session.verified = true;    // TODO: Change to type ID
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

module.exports = router;
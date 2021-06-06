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

    req.pool.getConnection(function(err, connection) {

        if (err) {
            console.log("Error at req.pool.getConnection");
            res.sendStatus(500);
            return;
        }

        var query1 = "SELECT * FROM UserProfile WHERE Email = ?;";
        connection.query(query1, [req.body.user], function(err,rows,fields) {
            connection.release();

            // console.log(rows); //check content of query

            if (err) {
                console.log("Error at connection.query");
                res.sendStatus(500);
                return;
            }

            // Nothing is returned from the query, and the user does not exist
            if (rows.length == 0) {
                req.verified = false;
                res.sendStatus(500);
            }
            // There is a return back from the query, and the user exists
            else {
                // WARNING: This may be insecure
                req.session.verified = true;
                req.session.userid = rows[0].UserID

                //console.log(req.session.userid);
                //console.log(req.session.verified);
                res.sendStatus(200);
            }
        });
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

    // Used for comparison later if needed. NOT STORED!
    var plaintextpw = newUser.password; 

    // Overwrite sent password with new hashed/salted password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newUser.password, salt);
    newUser.password = hash;

    // Check if email exists in database. If not, create new entry and allow user to log in.
    req.pool.getConnection(function(err, connection) {

        if (err) {
            console.log("Error at req.pool.getConnection");
            res.sendStatus(500);
            return;
        }

        // REVIEW: A lot of repeated code here, try to merge the user/manager blocks with conditional queries.
        // User selected
        if (newUser.type == "user") {
            //console.log("user selected");
            var query1 = "SELECT * FROM UserProfile WHERE Email = ?;";
            connection.query(query1, [newUser.email], function(err,rows,fields) {

                //console.log(rows); // check content of query

                if (err) {
                    console.log("Error at connection.query(select)");
                    res.sendStatus(500);
                    return;
                }

                // Account does not exist. Create a new account using provided email.
                if (rows.length == 0) {
                    var insertquery = "INSERT INTO UserProfile (Email, Password, FirstName, LastName) VALUES (?, ?, ?, ?);";
                    connection.query(insertquery, [newUser.email, newUser.password, newUser.fname, newUser.lname], function(err,rows,fields) {
                        connection.release();
                        if (err) {
                            console.log("Error at connection.query(insert)");
                            res.sendStatus(500);
                            return;
                        }
                        res.redirect('/');
                    });
                }
                // Account already exists. If the email and password are correct, sign them in.
                else {
                    connection.release();

                    // Verify password
                    var tf = bcrypt.compareSync(plaintextpw, rows[0].Password);
                    if (tf == true) {
                        req.session.verified = true;
                        req.session.userid = rows[0].UserID;
                        res.redirect('/');
                    }
                    // If the password is wrong but the email is correct, redirect user to /login
                    else {
                        res.redirect("/login");
                    }
                }
            });
        }
        // Venue manager selected
        else if (newUser.type == "manager") {
            //console.log("manager selected");
            var query1 = "SELECT * FROM VenueManager WHERE Email = ?;";
            connection.query(query1, [newUser.email], function(err,rows,fields) {

                //console.log(rows); //check content of query

                if (err) {
                    console.log("Error at connection.query(select)");
                    return;
                }

                // Account does not exist. Create a new account using provided email.
                if (rows.length == 0) {
                    var insertquery = "INSERT INTO VenueManager (Email, Password, FirstName, LastName) VALUES (?, ?, ?, ?);";
                    connection.query(insertquery, [newUser.email, newUser.password, newUser.fname, newUser.lname], function(err,rows,fields) {
                        connection.release();
                        if (err) {
                            console.log("Error at connection.query(insert)");
                            return;
                        }
                        res.redirect('/');
                    });

                }
                // Account already exists. If the email and password are correct, sign them in.
                else {
                    connection.release();

                    // Verify password
                    var tf = bcrypt.compareSync(plaintextpw, rows[0].Password);
                    if (tf == true){
                        req.session.verified = true;
                        req.session.managerid = rows[0].ManagerID;
                        res.redirect('/');
                    }
                    // If the password is wrong but the email is correct, redirect user to /login
                    else {
                        res.redirect("/login");
                    }
                }
            });
        }
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

    // REVIEW: This can be rewritten in a better way, a lot of repeated code here.
    req.pool.getConnection(function(err, connection) {
        if (err) {
            console.log("Error at req.pool.getConnection");
            res.sendStatus(500);
            return;
        }

        var usersquery = "SELECT * FROM UserProfile WHERE Email = ?;";
        connection.query(usersquery, [returningUser.email], function(err,rows,fields) {
            //console.log(rows); //check content of query
            if (err) {
                console.log("Error at connection.query(user)");
                return;
            }

            // Account does not belong to a user, check if account belongs to a venue manager.
            if (rows.length == 0) {
                var managersquery = "SELECT * FROM VenueManager WHERE Email = ?;";
                connection.query(managersquery, [returningUser.email], function(err,rows,fields) {
                    //console.log(rows); //check content of query
                    if (err) {
                        console.log("Error at connection.query(venue)");
                        return;
                    }
                    // Account does not belong to a user or venue manager, check if account belongs to a health official.
                    if (rows.length == 0) {
                        var officialsquery = "SELECT * FROM HealthOfficial WHERE Email = ?;";
                        connection.query(officialsquery, [returningUser.email], function(err,rows,fields) {
                            //console.log(rows); //check content of query
                            if (err) {
                                console.log("Error at connection.query(healthofficial)");
                                return;
                            }
                            // Account does not exist, redirect to /login.
                            if (rows.length == 0) {
                                res.redirect('/login');
                            } else { //email exists at health official level
                                connection.release();

                                var tf = bcrypt.compareSync(returningUser.password, rows[0].Password);
                                // DEBUG: Replace back with tf=true once we have a method for creating health official accounts
                                if (rows[0].HealthOfficialID == 1) {
                                    req.session.verified = true;
                                    req.session.healthofficalid = rows[0].HealthOfficialID;
                                    res.redirect('/');
                                }
                                // Password is wrong but the email exists, allow retry without reloading the page.
                                else {
                                    res.redirect("/login");
                                }
                            }
                        });
                    }
                    // Account belongs to a venue manager
                    else {
                        connection.release();
                        var tf = bcrypt.compareSync(returningUser.password, rows[0].Password);
                        if (tf == true) {
                            req.session.verified = true;
                            req.session.managerid = rows[0].ManagerID;
                            res.redirect('/');
                        }
                        // Password is wrong but the email exists, allow retry without reloading the page.
                        else {
                            res.redirect("/login");
                        }
                    }
                });
            }
            // Account belongs to a user
            else {
                connection.release();
                var tf = bcrypt.compareSync(returningUser.password, rows[0].Password);
                if (tf == true) {
                    req.session.verified = true;
                    req.session.userid = rows[0].UserID
                    res.redirect('/');
                }
                // Password is wrong but the email exists, allow retry without reloading the page.
                else {
                    res.redirect("/login");
                }
            }
        });
    });
});

module.exports = router;
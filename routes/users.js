var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var app = express();
var expressValidator = require('express-validator');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

var bcrypt = require('bcryptjs');





//google stuff
const CLIENT_ID = '1064925142905-hd2taue727i7qv0b858gltpde696poeu.apps.googleusercontent.com';
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/login', function(req, res, next) {

    if( 'user' in req.body ) {
        if(req.body.user in users){
            if(users[req.body.user] === req.body.pass){
                req.session.user = req.body.user;
                res.send(req.session.user);
            } else {
                res.sendStatus(401);
            }
        } else {
            res.sendStatus(401);
        }
    } else if( "token" in req.body ) {

        async function verify() {
          const ticket = await client.verifyIdToken({
              idToken: req.body.token,
              audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
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

router.post('/login/verifyDB', function(req,res,next){

    req.pool.getConnection(function(err, connection){
        if (err){
            res.sendStatus(500);
            return;
        }

        var query1 = "SELECT * FROM UserProfile WHERE Email = ?;";
        connection.query(query1, [req.body.user], function(err,rows,fields){
            connection.release();
            //console.log(rows); //check content of query

            if (err) { // if error no verify
                res.sendStatus(500);
                return;
            }

            if (rows.length==0){ // if rows empty ie nothing returned, user must not exist
                //console.log("Email did not verify"); //** to be removed
                req.verified=false;
                res.sendStatus(500);
            } else { //there is a return back from the query ie they exist in system
                req.session.verified=true;
                req.session.userid=rows[0].UserID

                //console.log(req.session.userid);
                //console.log(req.session.verified);
                res.sendStatus(200);

            }
        });
    });
});


//register account
router.post('/register', function(req, res, next) {

    //object to store user values;
    const newUser = {
          fname: req.body.fname,
          lname: req.body.lname,
          email: req.body.email, //make email non caps sensitive maybe theres a function idk
          password: req.body.password,
          type:req.body.type,
        }

    var plaintextpw=newUser.password; // for use comparing later if needed. NOT STORED;

    //overwrite sent password with new hashed/salted password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newUser.password, salt);
    newUser.password= hash;


    //check if email exists in database. If not, create new entry and allow user to log in.
    req.pool.getConnection(function(err, connection){
        if (err){
            res.sendStatus(500);
            return;
        }

        if (newUser.type=="user"){
            //console.log("user selected");
            var query1 = "SELECT * FROM UserProfile WHERE Email = ?;";
            connection.query(query1, [newUser.email], function(err,rows,fields){
                //console.log(rows); //check content of query
                if (err) {
                    return;
                }

                // if row.length=0 there are no entries therefore that unique email is not attached to any account and we can make one.
                if (rows.length==0){
                    var insertquery = "INSERT INTO UserProfile (Email, Password, FirstName, LastName) VALUES (?, ?, ?, ?);";
                    connection.query(insertquery, [newUser.email, newUser.password, newUser.fname, newUser.lname], function(err,rows,fields){
                        connection.release();
                        if (err) {
                            return;
                        }
                        res.redirect('/');
                    });

                } else { //this account already exists, cannot register again. If email and password are correct and in system, sign them in.
                    connection.release();

                    //verify password here
                    var tf=bcrypt.compareSync(plaintextpw, rows[0].Password);
                    if (tf==true){
                        req.session.verified=true;
                        req.session.userid=rows[0].UserID;
                        res.redirect('/');

                    } else {
                        //if password wrong but email correct direct them to /login?
                        res.redirect("/login");
                    }
                }
            });
        } else if (newUser.type=="manager"){ //if manager radio button selected, create manager account
            //console.log("manager selected");
            var query1 = "SELECT * FROM VenueManager WHERE Email = ?;";
            connection.query(query1, [newUser.email], function(err,rows,fields){
                //console.log(rows); //check content of query
                if (err) {
                    return;
                }

                // if row.length=0 there are no entries therefore that unique email is not attached to any account and we can make one.
                if (rows.length==0){
                    var insertquery = "INSERT INTO VenueManager (Email, Password, FirstName, LastName) VALUES (?, ?, ?, ?);";
                    connection.query(insertquery, [newUser.email, newUser.password, newUser.fname, newUser.lname], function(err,rows,fields){
                        connection.release();
                        if (err) {
                            return;
                        }
                        res.redirect('/');
                    });

                } else { //this account already exists, cannot register again. If email and password are correct and in system, sign them in.
                    connection.release();

                    //verify password here
                    var tf=bcrypt.compareSync(plaintextpw, rows[0].Password);
                    if (tf==true){
                        req.session.verified=true;
                        req.session.managerid=rows[0].ManagerID;
                        res.redirect('/');

                    } else {
                        //if password wrong but email correct direct them to /login?
                        res.redirect("/login");
                    }
                }
            });
        }
    });
});

//regular login functionality
router.post('/regular-login', function(req, res, next) {
    // TODO: Add input validation and implement server-side

    var returningUser={
        email: req.body.email, //need to make all this non caps sensitive
        password: req.body.password,
    }


    req.pool.getConnection(function(err, connection){
        if (err){
            res.sendStatus(500);
            return;
        }

        var usersquery="SELECT * FROM UserProfile WHERE Email = ?;";
        connection.query(usersquery, [returningUser.email], function(err,rows,fields){
            //console.log(rows); //check content of query
            if (err) {
                return;
            }

            // if row.length=0 there are no entries therefore that email is not attached to a userprofile account. Check against venue/health official accounts within this if statement.
            if (rows.length==0){
                //console.log("email not in system");
                var managersquery="SELECT * FROM VenueManager WHERE Email = ?;";
                connection.query(managersquery, [returningUser.email], function(err,rows,fields){
                    //console.log(rows); //check content of query
                    if (err) {
                        return;
                    }

                    if (rows.length==0){ //means there is both no users and no managers with that email in the system. try health officials.
                        var officialsquery="SELECT * FROM HealthOfficial WHERE Email = ?;";
                        connection.query(officialsquery, [returningUser.email], function(err,rows,fields){
                            //console.log(rows); //check content of query
                            if (err) {
                                return;
                            }

                            if (rows.length==0){ //means there is both no users and no managers AND no health officials with that email in the system. email does not exist in system. give error.
                                res.redirect('/login');
                            } else { //email exists at health official level
                                connection.release();

                                var tf=bcrypt.compareSync(returningUser.password, rows[0].Password);
                                if (rows[0].HealthOfficialID==1){ //replace back with tf=true once we have a method for create health official accounts, currently debug

                                    req.session.verified=true;
                                    req.session.healthofficalid=rows[0].HealthOfficialID;
                                    res.redirect('/');

                                } else {
                                    //password wrong but email exists. reprompt them, preferably without reloading the page.
                                    res.redirect("/login");
                                }


                            }
                        });
                    } else { //email does exist at venue management level
                        connection.release();
                        var tf=bcrypt.compareSync(returningUser.password, rows[0].Password);
                        if (tf==true){
                            req.session.verified=true;
                            req.session.managerid=rows[0].ManagerID;
                            res.redirect('/');

                        } else {
                            //password wrong but email exists. reprompt them, preferably without reloading the page.
                            res.redirect("/login");
                        }
                    }
                });

            } else { //email does exist at userprofile level.
                connection.release();
                var tf=bcrypt.compareSync(returningUser.password, rows[0].Password);
                if (tf==true){
                    req.session.verified=true;
                    req.session.userid=rows[0].UserID
                    res.redirect('/');

                } else {
                    //password wrong but email exists. reprompt them, preferably without reloading the page.
                    res.redirect("/login");
                }
            }
        });
    });
});

module.exports = router;
var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var app = express();
var expressValidator = require('express-validator');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());


var LocalStrategy   = require('passport-local').Strategy;



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

                console.log(req.session.userid);
                console.log(req.session.verified);
                res.sendStatus(200);

            }
        });
    });
});


//register account





var bcrypt = require('bcryptjs');


router.post('/register', function(req, res, next) {
     // TODO: Add input validation and implement server-side
    const newUser = {
          fname: req.body.fname,
          lname: req.body.lname,
          email: req.body.email,
          password: req.body.password,
        }



    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newUser.password, salt);

    newUser.password= hash;

    console.log(newUser.password);


    req.pool.getConnection(function(err, connection){
        if (err){
            res.sendStatus(500);
            return;
        }

        var query1 = "SELECT * FROM UserProfile WHERE Email = ?;";
        connection.query(query1, [newUser.email], function(err,rows,fields){
            console.log(rows); //check content of query

            if (err) { // if error no verify
                return;
            }

            if (rows.length==0){ // if rows empty ie nothing returned, email is not attached to an account therefore create one
                console.log("valid email"); // to be removed
                var insertquery = "INSERT INTO UserProfile (Email, Password, FirstName, LastName) VALUES (?, ?, ?, ?);";
                connection.query(insertquery, [newUser.email, newUser.password, newUser.fname, newUser.lname], function(err,rows,fields){
                    connection.release();
                    if (err) { // if error no verify
                        return;
                    }

                });

            } else { //this account already exists, cannot register again
                console.log("email already exists in system"); //if the email already exist and password right then we can just log them in here.
                req.session.verified=true;
                req.session.userid=rows[0].UserID


            }
        });
    });
    
    
    res.redirect('/');
});














module.exports = router;

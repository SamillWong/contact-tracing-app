var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var app = express();
var expressValidator = require('express-validator');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

router.get('/profile', function(req, res, next) {

    req.pool.getConnection(async function(err, connection) {
        if (err) {
            res.sendStatus(500);
        }

        // Query the database with provided email address and return a Promise object
        getPromise = (query) => {
            return new Promise((resolve, reject) => {
                // FIXME: Use separate ID
                connection.query(query, [req.session.userid], function(err,rows,fields) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(rows);
                });
            });
        }

        // Construct rows from each query
        async function makeQuery() {
            const userQuery = "SELECT * FROM User WHERE UserID = ?;";
            const managerQuery = "SELECT * FROM VenueManager WHERE ManagerID = ?;";
            const officialQuery = "SELECT * FROM HealthOfficial WHERE HealthOfficialID = ?;";
            try {
                const promises = [getPromise(userQuery), getPromise(managerQuery), getPromise(officialQuery)];
                return await Promise.all(promises);
            } catch (err) {
                console.log(err);
            }
        }
        var result = await makeQuery();
        connection.release();

        // Loop through each account type and return user information
        for (let i = 0; i < 3; i++) {
            if (result[i].length) {
                // Hide password hash from result
                delete result[i][0]["Password"];
                res.send(JSON.stringify(result[i][0]));
                break;
            } else if (i == 2) {
                res.sendStatus(401);
            }
        }
    });
});

module.exports = router;
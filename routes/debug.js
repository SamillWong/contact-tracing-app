var express = require('express');
var router  = express.Router();

/* DEBUG: Show session data */
router.get('/session', function(req, res) {
    return res.send(req.session);
});

module.exports = router;
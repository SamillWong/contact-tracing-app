var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
require('dotenv').config();

var indexRouter = require('./routes/index');
var dashboardRouter = require('./routes/dashboard');
var oauthRouter = require('./routes/oauth');
var venueRouter = require('./routes/venue');
var adminRouter = require('./routes/admin');
var apiRouter = require('./routes/api');
var debugRouter = require('./routes/debug');

var app = express();

// Favicon middleware
app.use(favicon(path.join(__dirname, 'public', 'media', 'favicon.ico')));
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Parse application/json
app.use(bodyParser.json());

// MySQL connection
var dbConnectionPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

dbConnectionPool.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query('SELECT 1 + 1 AS solution', function (err, rows) {
        connection.release();
        if (err) throw err;
        if (rows[0].solution == 2) {
            console.log(`Connected to ${process.env.DB_NAME} database on ${process.env.DB_HOST} as ${process.env.DB_USER}`);
        }
    });
});

app.use(function (req, res, next) {
    req.pool = dbConnectionPool;
    // Remove trailing slashes
    if (req.path.substr(-1) == '/' && req.path.length > 1) {
        var query = req.url.slice(req.path.length);
        res.redirect(301, req.path.slice(0, -1) + query);
    } else {
        next();
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 600000 }
}));

// Session middleware
app.get(['/login', '/register'], function (req, res, next) {
    switch (req.session.verified) {
        case 1: return res.redirect('/profile');
        case 2: return res.redirect('/venue');
        case 3: return res.redirect('/admin');
    }
    next();
});

app.post(['/login', '/register'], function (req, res, next) {
    if (req.session.verified) return res.sendStatus(200);
    next();
});

app.get('/profile*', function (req, res, next) {
    if (req.session.verified > 0) {
        next();
    } else {
        return res.redirect("/login?redirect="+encodeURIComponent(req.url));
    }
});

app.get('/dashboard*', function (req, res, next) {
    if (req.session.verified == 1) {
        next();
    } else {
        return res.redirect("/login?redirect="+encodeURIComponent(req.url));
    }
});

app.get('/venue*', function (req, res, next) {
    if (req.session.verified == 2) {
        next();
    } else {
        return res.redirect("/login?redirect="+encodeURIComponent(req.url));
    }
});

app.get('/admin*', function (req, res, next) {
    if (req.session.verified == 3) {
        next();
    } else {
        return res.redirect("/login?redirect="+encodeURIComponent(req.url));
    }
});

app.post('/profile*', function (req, res, next) {
    if (req.session.verified > 0) {
        next();
    } else {
        return res.sendStatus(401);
    }
});

app.post('/dashboard*', function (req, res, next) {
    if (req.session.verified == 1) {
        next();
    } else {
        return res.sendStatus(401);
    }
});

app.post('/venue*', function (req, res, next) {
    if (req.session.verified == 2) {
        next();
    } else {
        return res.sendStatus(401);
    }
});

app.post('/admin*', function (req, res, next) {
    if (req.session.verified == 3) {
        next();
    } else {
        return res.sendStatus(401);
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/dashboard', dashboardRouter);
app.use('/oauth', oauthRouter);
app.use('/venue', venueRouter);
app.use('/admin', adminRouter);
app.use('/api', apiRouter);
// Debug routes disabled in production
// app.use('/debug', debugRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error.ejs', { params: { verified: req.session.verified } });
});

module.exports = app;

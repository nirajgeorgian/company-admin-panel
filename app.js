const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const ejs = require('ejs')
const engine = require('ejs-mate')
const helmet = require('helmet')
var session = require('express-session')
var cookieParser = require('cookie-parser')
var flash = require('express-flash')
var MongoStore = require('connect-mongo/es5')(session)
var passport = require('passport')
var secret = require('./config/secret')
var app = express()

// Use helemt for secure
// app.use(helmet.frameguard({
//   action: 'deny'
// }))
// app.use(helmet.hidePoweredBy({
//   setTo: 'riti'
// }))
// app.use(helmet.noSniff())
// app.use(helmet.xssFilter())
// app.use(helmet.ieNoOpen())

// app.set('trust proxy', 1) // trust first proxy
app.engine('ejs', engine)
app.set('view engine', 'ejs')


//mongodb configuration
mongoose.connect(secret.database, (err) => {
  if (err) return err;
  console.log("Connecting to database succeded")
})
app.use(flash())

//using middleware
app.use(express.static(path.join(__dirname, 'public')))
app.use(morgan('dev'))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secret.secretKey,
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  store: new MongoStore({url: secret.database, autoreconnect: true})
}))
app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
  res.locals.user = req.user
  next()
})
//Routes
var mainRoute = require('./routes/indexRoutes')
var routerRoute = require('./routes/adminRoutes')
var tagsRoute = require('./routes/tagsRoutes')
var singleUserRoutes = require('./routes/singleUserRoutes')
var tasksAllRoutes = require('./routes/tasksRoutes')
var stagesRoutes = require('./routes/stagesRoutes')
var cronRoute = require('./routes/cronMail')
app.use(routerRoute)
app.use(mainRoute)
app.use(tagsRoute)
app.use(stagesRoutes)
app.use(singleUserRoutes)
app.use(tasksAllRoutes)
app.use(cronRoute)

app.use(function(req, res, next) {
	res.status(404);
	res.send("Page not found. It's a 404 error");
	next();
});

app.use(function(err, req, res, next) {
	res.status(500);
	res.send("Internal server error");
});

// Server configuration
var server = app.listen(secret.port, (err) => {
  if (err) return err;
  var host = server.address().address;
  var port = server.address().port;
  console.log('App listening at http://%s:%s', host, port);
  // console.log("Running on 127.0.0.1:"+secret.port)
})

server.on('error', (err) => {
  if (err.code == 'EADDRINUSE') {
    console.log("Address in Use, Retrying to connect.... ")
    setTimeout(() => {
      server.close()
      server.listen(secret.port)
    }, 1000)
  }
})

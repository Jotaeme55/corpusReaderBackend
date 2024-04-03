var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("./passport/setup");

var app = express();
const corsOptions ={
  origin:'*'
}

app.use(cors(corsOptions));
//app.use(cors());

app.use(bodyParser.json());
app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({limit: '100mb'}));
app.use(cookieParser());

// Bodyparser middleware, extended false does not allow nested payloads
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(
  session({
      secret: "very secret this is",
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({ mongoUrl: process.env.MONGO_URL || "mongodb://localhost/beelasy" })
  })
);


frontendURL = process.env.VUE_APP_FRONTEND_URL || "http://localhost:8081"



app.get("/", (req, res) => {
  res.redirect(frontendURL);
});


app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/projects', require('./routes/projects'));
app.use('/api/v1/corpus', require('./routes/corpus'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/sendConfirmation', require('./routes/sendConfirmation'));
app.use('/api/v1/test' , require('./routes/test'))

module.exports = app;

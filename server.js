var express = require("express");
var path = require("path");
const data = require("./data-service.js");
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const clientSessions = require('client-sessions');
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

app.use(clientSessions({
    cookieName: "session", 
    secret: "Matthew_DeDominicis_d1apjn6jsnk0ct", 
    duration: 5 * 60 * 1000, 
    activeDuration: 1000 * 60 
  }));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('views'));
app.use(bodyParser.urlencoded({ extended: true }));

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/home", ensureLogin, (req, res) => {
    res.render("home");
});

app.get("/registration", (req, res) => {
    res.render("registration");
});

app.get("/logout", (req, res)=> {
    req.session.reset();
    res.redirect('/');
});

app.post("/registration", (req, res)=> {
    data.registerUser(req.body)
    .then(() => {
        res.render("success");
    }).catch((err) => {
        console.log(err);
        res.render("registration", {errorMessage: err, userName: req.body.userName});

    });
});

app.post("/login", (req, res) =>{
    req.body.userAgent = req.get('User-Agent');
    data.checkUser(req.body).then((user) => {
        req.session.user = { 
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory }
        res.redirect("/home");
    }).catch((err)=>{
        console.log(err);
        res.render("login", {errorMessage: err, userName: req.body.userName});
    });
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

data.initialize().then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT);
    });
    }).catch(function(err){
        console.log("unable to start server: " + err);
});

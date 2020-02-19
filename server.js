var express = require("express");
var path = require("path");
const data = require("./data-service.js");
const bodyParser = require('body-parser');
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
    res.sendFile(path.join(__dirname, "/views/login.html"));
});

app.get("/home", ensureLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/registration", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/registration.html"));
});

app.post("/registration", (req, res)=> {
    data.registerUser(req.body)
    .then(() => {
        res.sendFile(path.join(__dirname, "/views/success.html"));
    }).catch((err) => {
        console.log(err);
        res.sendFile(path.join(__dirname, "/views/registration.html"));
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
        res.sendFile(path.join(__dirname, "/views/login.html"));
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

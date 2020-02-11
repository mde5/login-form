var path = require("path");
var express = require("express");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('views'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/login.html"));
});

app.listen(HTTP_PORT, onHttpStart);
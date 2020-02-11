var HTTP_PORT = process.env.port || 8080;
var express = require("express");
var app = express();

app.get("/", (req, res) => {
    res.send("Welcome!");
});

app.listen(HTTP_PORT);
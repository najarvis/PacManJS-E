var gameport = process.env.PORT || 3333;
var app      = require('express')();
var http     = require('http').Server(app);

http.listen(gameport, function() {
    console.log("Listening on port: " + gameport);   
});

app.get('/', function(req, res){
    res.sendFile(__dirname + "/pages/index.html"); 
});

app.get('/*', function(req, res, next){
    res.sendFile(__dirname + '/' + req.params[0]);
});

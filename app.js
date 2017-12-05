var gameport   = process.env.PORT || 3333;
var app        = require('express')();
var http       = require('http').Server(app);
var fs         = require('fs');
var bodyParser = require('body-parser');

app.use(bodyParser.json());

http.listen(gameport, function() {
    console.log("Listening on port: " + gameport);   
});

app.get('/', function(req, res){
    res.sendFile(__dirname + "/pages/index.html"); 
});

app.get('/get_high_scores', function(req, res) {
	var obj = JSON.parse(fs.readFileSync('high_scores.json', 'utf8'));
	res.send(obj);
});

app.post('/update_high_scores', function(req, res) {
	var data = JSON.stringify(req.body);
	fs.writeFileSync('high_scores.json', data);
	res.send(data);
});

app.get(['/res/*', '/game_scripts/*'], function(req, res, next){
    res.sendFile(__dirname + '/' + req.url);
});

// init project
var express = require("express");
var app = express();
const port = 3000;

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
	res.sendFile(__dirname + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
	res.json({ greeting: "hello API" });
});

app.get("/api/whoami", function (req, res) {
	var result_json = {};
	result_json["ipaddress"] = req.ip;
	result_json["language"] = req.get("Accept-Language");
	result_json["software"] = req.get("User-Agent");

	res.send(result_json);
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`));
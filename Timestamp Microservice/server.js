const express = require("express");
const app = express();
const port = 3000;

// middleware
app.use(express.static("public"));

app.get("/", function (req, res) {
	res.sendFile(__dirname + "/views/index.html");
});

// this endpoint in the API handles all the valid Date objects in Javascript
app.get("/api/:date_string?", function (req, res) {
	const dateString = req.params.date_string;
	let date;
	// if the date string is empty, it should be equivalent to today's date
	// date= new Date() generates the current timestamp
	if (!dateString) {
		date = new Date();
	} else {
		// if the date string is not empty, and not an integer (eg: 1451001600000),
		// which is checked by isNaN() (not a number), it is converted into a date object
		if (isNaN(dateString)) {
			date = new Date(dateString);
		} else {
			// if the date string is an integer, it is converted into a date object 
			// by parsing it into an integer first
			date = new Date(parseInt(dateString));
		}
	}
	// for invalid dates (eg: "hello"), the date object is set to "Invalid Date"
	if (date.toString() === "Invalid Date") {
		res.json({ error: "Invalid Date" });
	} else {
		// hence the date object is created, it is converted into a JSON object. 
		res.json({ unix: date.getTime(), utc: date.toUTCString() });
	}
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

const dns = require("dns");
const urlParser = require("url");

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
});

// Schema
const Schema = mongoose.Schema({ url: { type: String, required: true } });
const Url = mongoose.model("url", Schema);

// middleware for handling the validity of url
var isDomain = async (req, res, next) => {
	var url_to_shorten = req.body.url;
	var domain_start = url_to_shorten.indexOf(".") + 1;
	var domain_end = url_to_shorten.indexOf(".", domain_start) + 4;
	var domain = url_to_shorten.substring(domain_start, domain_end);
	const options = {
		family: 6,
		hints: dns.ADDRCONFIG | dns.V4MAPPED,
	};
	dns.lookup(domain, function (err, address, family) {
		req.domain = address;
		console.log(req.domain);
		next();
	});
};

var isValidUrl = (req, res, next) => {
	var pattern = new RegExp(
		"^(https?:\\/\\/)" + // protocol
			"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
			"((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
			"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
			"(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
			"(\\#[-a-z\\d_]*)?$",
		"i"
	); // fragment locator
	req.isValid = pattern.test(req.body.url);
	next();
};

// app.use("/api/shorturl", isDomain);

// Your first API endpoint
app.get("/api/hello", function (req, res) {
	res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", isValidUrl, async (req, res) => {
	try {
		const urlCheck = req.body.url;
		dns.lookup(urlParser.parse(urlCheck).hostname, async (error, address) => {
			if (!address) {
				res.json({ error: "invalid url" });
			} else {
				const newURL = new Url({ url: urlCheck });
				await newURL.save();
				res.json({
					original_url: urlCheck,
					short_url: newURL._id,
				});
			}
		});
	} catch (err) {
		console.log(err);
	}
});

app.get("/api/shorturl/:id", async(req, res) => {
	const id = req.params.id;
	try {
		await Url.findById(id, (err, data) => {
			if (!data) {
				res.json({ error: "invalid url" });
			} else {
				res.redirect(data.url);
			}
		});
	} catch (err) {
		console.log(err);
	}
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});

// isDomain function
var isDomain = async (req, res, next) => {
	var url_to_shorten = req.body.url;
	var domain_start = url_to_shorten.indexOf(".") + 1;
	var domain_end = url_to_shorten.indexOf(".", domain_start) + 4;
	var domain = url_to_shorten.substring(domain_start, domain_end);
	const options = {
		family: 6,
		hints: dns.ADDRCONFIG | dns.V4MAPPED,
	};
	dns.lookup(domain, function (err, address, family) {
		req.domain = address;
		console.log(req.domain);
		next();
	});
}
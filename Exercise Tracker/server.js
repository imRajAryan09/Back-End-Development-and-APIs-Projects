const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/views/index.html");
});

const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require("mongoose");

// mount the body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// connect the application to the database
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// define the schema
const Schema = mongoose.Schema;
const userSchema = new Schema({
	username: {
		type: String,
		required: true,
	},
	log: [],
});

const ExcerciseSchema = new Schema({
	userId: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	duration: {
		type: Number,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
});

// define the model, on which all documents will be based
const User = mongoose.model("User", userSchema);
const Excercise = mongoose.model("Excercise", ExcerciseSchema);

app.post("/api/users", (req, res) => {
	const { username } = req.body;
	User.findOne({ username: username }, (err, user) => {
		if (err) {
			res.send(err);
		}
		if (user) {
			res.send("User already exists");
		} else {
			const newUser = new User({ username: username, log: [] });
			newUser.save((err, user) => {
				if (err) {
					res.send(err);
				}
				const { _id, username } = user;
				res.send({
					_id,
					username,
				});
			});
		}
	});
});

app.get("/api/users", (req, res) => {
	User.find({}, (err, users) => {
		if (err) {
			res.send(err);
		}
		res.send(users);
	});
});

app.post("/api/users/:_id/exercises", (req, res) => {
	const { description, duration, date } = req.body;
	const { _id } = req.params;
	User.findById(_id, (err, user) => {
		if (err) {
			res.send(err);
		}
		if (user) {
			const excercise = new Excercise({
				userId: _id,
				description: description,
				duration: duration,
				date: date,
			});
			excercise.save((err, excercise) => {
				if (err) {
					res.send(err);
				}
				const { description, duration, date } = excercise;
				const log = {
					description,
					duration,
					date: date.toDateString(),
				};
				user.log.push(log);
				user.save((err, user) => {
					if (err) {
						res.send(err);
					}
				});
				res.send({
					username: user.username,
					description,
					duration,
					date: date.toDateString(),
					_id,
				});
			});
		}
	});
});

app.get("/api/users/:id/logs", (req, res) => {
	const { from, to, limit } = req.query;
	console.log(from, to, limit);
	const { id } = req.params;
	User.findById(id, (err, user) => {
		if (err) {
			res.send(err);
		}
		if (user) {
			const { username, _id, log } = user;
			let responseLog = [...log];
			console.log(responseLog);
			if (from && to) {
				responseLog = responseLog.filter(
					(log) =>
						new Date(log.date).getTime() >= new Date(from).getTime() &&
						new Date(log.date).getTime() <= new Date(to).getTime()
				);
			}
			console.log(responseLog);
			if (limit) {
				responseLog = responseLog.slice(0, limit);
			}
			// retrieve the length of the updated array
			const count = responseLog.length;
			res.send({
				username,
				count,
				_id,
				log: responseLog,
			});
		} else {
			// findOne() returns null, detail how the userId does not match an existing document
			res.send("unknown userId");
		}
	});
});

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log("Your app is listening on port " + listener.address().port);
});

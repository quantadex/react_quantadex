var express = require('express')
var currentApp = express()
var path = require("path");
var bodyParser = require('body-parser');
import { registerAccount } from "./register";
import { GetLeaderboard } from "./leaderboard";

currentApp.use(bodyParser.json());
currentApp.use("/public", express.static(path.join(__dirname, './public')))

let currentLeaderboard = null;
let lockFetch = false;

currentApp.get('/api/leaderboard', function (req, res) {
	function fetchLeaderboard(cb) {
		// previously locked, show the existing data
		if (lockFetch) {
			cb(currentLeaderboard)
			return
		}
		lockFetch = true
		
		// locking new call, show new data
		if (currentLeaderboard) {
			cb(currentLeaderboard)
		}

		// console.log("Fetching leaderboard.")
		GetLeaderboard().then((result) => {
			currentLeaderboard = result
			currentLeaderboard.timestamp = new Date()
			lockFetch = false
			cb(currentLeaderboard)
		})	
	}
	
	if (currentLeaderboard == null) {
		fetchLeaderboard((data) => {
			res.json(currentLeaderboard)
		})
	} else {
		var seconds = (new Date().getTime() - currentLeaderboard.timestamp.getTime()) / 1000;
		if (seconds > 300) {
			console.log("Over 5 minutes, fetch data again.")
			fetchLeaderboard((data) => {
				res.json(data)
			})
		} else {
			res.json(currentLeaderboard)
		}
	}
})

currentApp.post('/api/register', function (req, res) {
	const data = req.body;
	registerAccount(data.user_name, data.public_key)
	.then((e) =>{
		res.send(e);
	})
	.catch(e => {
		console.log("exception",e.message);
		res.status(500).send({message: e.message});
	})
})

currentApp.get('/*', function (req, res) {
	const fileName = path.join(__dirname + '/public/index.html')
  res.sendFile(fileName);
})

console.log("Listening to 3000")
currentApp.listen(3000);

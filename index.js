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
	function fetchLeaderboard() {
		if (lockFetch) {
			res.json(currentLeaderboard)
			return
		}
		console.log("Fetching leaderboard.")
		lockFetch = true
		GetLeaderboard().then((result) => {
			currentLeaderboard = result
			currentLeaderboard.timestamp = new Date()
			lockFetch = false
			res.json(result)
		})	
	}
	
	if (currentLeaderboard == null) {
		fetchLeaderboard()
	} else {
		var seconds = (new Date().getTime() - currentLeaderboard.timestamp.getTime()) / 1000;
		if (seconds > 300) {
			console.log("Over 5 minutes, fetch data again.")
			fetchLeaderboard()
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

var express = require('express')
var currentApp = express()
var path = require("path");
var bodyParser = require('body-parser');
import { registerAccount } from "./register";
import { GetLeaderboard } from "./leaderboard";
import { MarketsAPI } from "./markets_api";

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
			result.timestamp = new Date()
			// if leaderboard was there already, don't send it
			if (currentLeaderboard == null) {
				cb(result)
			}

			currentLeaderboard = result
			lockFetch = false
		})
		.catch(ex => {
			console.log("error: ", ex);
		})
	}
	
	if (currentLeaderboard == null) {
		fetchLeaderboard((data) => {
			res.json(data)
		})
		setInterval(() => {
			fetchLeaderboard((data) => {})
		}, 15*60*1000)
	} else {
		res.json(currentLeaderboard)
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

currentApp.get('/api/:type', function (req, res) {
	MarketsAPI(req.params.type, req.query).then((e) => {
		res.json(e)
	})
	.catch(e => {
		res.status(500).send({message: e.message});
	})
})

currentApp.get('/*', function (req, res) {
	const fileName = path.join(__dirname + '/public/index.html')
  res.sendFile(fileName);
})

console.log("Listening to 3000")
currentApp.listen(3000);

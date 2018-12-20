var express = require('express')
var currentApp = express()
var path = require("path");
var bodyParser = require('body-parser');
import { registerAccount } from "./register";

currentApp.use(bodyParser.json());
currentApp.use("/public", express.static(path.join(__dirname, './public')))

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

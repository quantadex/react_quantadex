var express = require('express')
var currentApp = express()
var path = require("path");

currentApp.use("/public", express.static(path.join(__dirname, './public')))

// respond with "hello world" when a GET request is made to the homepage
currentApp.get('/*', function (req, res) {
	const fileName = path.join(__dirname + '/public/index.html')
  res.sendFile(fileName);
})

console.log("Listening to 3000")
currentApp.listen(3000);


// Socket to listen to ... HTTP requests to http://yourname.webide.se/_somename will be redirected to to /sock/_somename
var unixSocket = "/sock/_jsql";

// We need the group (www-data) to have write access to the unix socket
var newMask = parseInt("0007", 8); // four digits, last three mask, ex: 0o027 => 750 file permissions
var oldMask = process.umask(newMask);
console.log("Changed umask from " + oldMask.toString(8) + " to " + newMask.toString(8));

var http = require('http');
var httpServer = http.createServer();
httpServer.on("request", httpRequest);
httpServer.on("error", httpServerError);
httpServer.on("listening", notifyListening);
httpServer.listen(unixSocket);

var sockjs = require('sockjs');
var sockjsServer = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });
sockjsServer.on('connection', function(conn) {
	var IP = conn.headers["x-real-ip"] || conn.remoteAddress;
	console.log("New sockjs connection from " + IP);
	conn.on('data', function(message) {
		console.log(IP + " <= " + message);
		conn.write(message);
	});
	conn.on('close', function() {});
});

sockjsServer.installHandlers(httpServer, {prefix:'/sockjs'});


function httpRequest(request, response) {
	console.log("Request to " + request.url + " from " + (request.headers["x-real-ip"] || request.connection.remoteAddress));
	response.end('Hello from jsql!');
}

function httpServerError(err) {
	console.log("HTTP server error: " + err.message);
	if (err.code == 'EADDRINUSE') {
		// We'll delete the existing socket and retry listening ...
		var fs = require("fs");
		fs.unlinkSync(unixSocket);
		httpServer.listen(unixSocket);
	}
	else throw err; // Something else is wrong
}

function notifyListening() {
	console.log("Listening on http://" + process.env.myName + ".webide.se/" + unixSocket.split("/")[2]);
}

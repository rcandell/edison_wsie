var http = require('http');
var resn = 1;

var serverip = '127.0.0.1';
var serverport = 1337;

http.createServer( function (req, res) {
	//console.log(req.url);
	res.writeHead(200, {'Content-Type':'text/plain'});
	res.end('Hello World ' + resn.toString() + '\n');
	if (! (req.url == '/favicon.ico') )	resn+=1;
}).listen(serverport, serverip);

console.log('Server running at ' + serverip + ' port: ' + 
	serverport.toString());


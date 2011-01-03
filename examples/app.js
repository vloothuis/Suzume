var url = require('url');
var http = require('http');
var fs = require('fs');

var routing = require('../routing');

var myRoutes = [
    ["/say-?/", function (request, response, name) {
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.write('<a href="');
	response.write(this.reverse('hello', name));
	response.write('">');
	response.write(name);
	response.write('</a>');
	response.end();
    }, 'say'],
    ["/hello-?/", function (request, response, name) {
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.write('<h1>');
	response.write(name);
	response.write('</h1>');
	response.end();
    }, 'hello']
];

var app = routing.createApp(myRoutes, function (request, response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Path: ' + url.parse(request.url).pathname + '\n');
    response.end('Sorry, I can not find what you are looking for.\n');
});

http.createServer(app).listen(8124);

console.log('Server running at http://127.0.0.1:8124/');

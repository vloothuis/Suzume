var url = require('url');

exports.flattenRoutes = function (routes) {
    var flattened = [];
    routes.forEach(
	function (route) {
	    var isRoute = !Array.isArray(route[0]);
	    if (isRoute) {
		flattened.push(route);
	    } else {
		// Assume route point to an array containing routes.
		flattened = flattened.concat(exports.flattenRoutes(route));
	    }
	});
    return flattened;
};

exports.findView = function (uri, routes) {
    for (var i = 0, len = routes.length; i < len; i++) {
	var pattern = routes[i][0], view = routes[i][1];
	var extracted = pattern.exec(uri);
	if(extracted!=null) {
	    return [view, extracted];
	}
    }
    return null;
};

exports.executeView = function (app, request, response, view, extracted) {
    // By removing the first part from extracted we are left with the
    // captured url fragments.
    var args = [request, response].concat(extracted.slice(1));
    view.apply(app, args);
};

exports.compileRouteTable = function (routes) {
    return routes.map(function (route) {
	var pattern = route[0], view = route[1];
	return [new RegExp('^' + pattern.split("?").join("([^/]+)")  + '$'),
		view];
    });
};

function createPublisher(routeTable, notFound) {
    if (!notFound) {
	notFound = function(request, response) {
	    response.writeHead(404, {'Content-Type': 'text/plain'});
	    response.write('Path: ' + url.parse(request.url).pathname + '\n');
	    response.end('Not Found\n');
	};
    }
    return function (app, request, response) {
	var path = url.parse(request.url).pathname;
	var found = exports.findView(path, routeTable);
	if(found!=null){
	    exports.executeView(app, request, response, found[0], found[1]);
	} 
	else {
	    // Try a lookup with / without trailing slash
	    if(path.charAt(path.length - 1) === '/') {
		path = path.substr(0, path.length - 2);
	    } else {
		path = path + '/';
	    }
	    if(exports.findView(path, routeTable)) {
		// Redirect to the proper url with a permanent redirect
		response.writeHead(301, {'Location': path});
		response.end();
	    } else {
		notFound(request, response);
	    }
	}
    };
}

exports.appendInMap = function (map, key, value) {
    var items = map[key];
    if(!items) {
	map[key] = items = [];
    };
    items.push(value);
    return map;
};

function interleave() {
    var max = 0;
    Array.prototype.forEach.call(arguments, function (arg) {
	if(max < arg.length){
	    max = arg.length;
	}});
    var results = [];

    for(var i=0; i<max; i++) {
	for(var j=0, len=arguments.length; j<len; j++) {
	    results.push(arguments[j][i]);
	}
    }
    return results;
}

function createReverser(routes) {
    var reversalMap = {};
    routes.forEach(function (route) {
	var pattern = route[0], view = route[1], name = route[2];
	if(name) {
	    exports.appendInMap(reversalMap, name, pattern);
	}
    });

    return function (view) {
	var patterns = reversalMap[view];
	var args = [];
	var len, i;
	for(i=1, len=arguments.length; i<len; i++) {
	    args.push(arguments[i]);
	};
	var viewArgCount = args.length + 1;
	for(i=0, len=patterns.length; i<len; i++){
	    var pattern = patterns[i];
	    var splitted = pattern.split("?");
	    if(splitted.length === viewArgCount) {
		return interleave(splitted, args).join("");
	    }
	}
	return null;
    };
}

exports.createApp = function (routes, notFound) {
    var flattened = exports.flattenRoutes(routes);
    var publisher = createPublisher(exports.compileRouteTable(flattened), notFound);
    var app = function app(request, response) {
	publisher(app, request, response);
    };
    app.reverse = createReverser(flattened);
    app.publish = publisher;
    return app;
};



// TODO: Add some middleware for logging. Use cookie-node for
// cookies. Make a REST wrapper function to handle only specified
// methods. Use Connect? Make it possible to mount multiple apps. Add
// unittests. Support virtual hosting.
// Look at test infra: http://expressjs.com/

// Templating:
// http://github.com/visionmedia/ejs
// http://github.com/jed/tmpl-node
// http://wiki.github.com/bard/seethrough_js/ (zpt style)
// http://jade-lang.com/
// http://github.com/edspencer/jaml/ (clojure style)

// For reloading:
// http://github.com/lrbabe/node-DJs
// http://github.com/shimondoodkin/nodejs-autorestart

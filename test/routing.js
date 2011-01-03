var routing = require('../routing');

module.exports = {
    'appendInMap': function (assert) {
	var map = {}
	routing.appendInMap(map, 'eye', 'patch')
        assert.eql({"eye":["patch"]}, map);
    },

    'flattenRoutes': function (assert) {
	var view =  function () {};
	assert.eql([["/polly", view]],
		   routing.flattenRoutes([[[[["/polly", view]]]]]));
    },

    'findView': function (assert) {
	var routes = [[/pirate-(\w+)/, 'view']];
	var matched = routing.findView('/pirate-treasure', routes)
	assert.eql('view', matched[0]);
	assert.eql('treasure', matched[1][1]);
    },

    'executeView': function (assert) {
	var toggle = false;
	var view = function (request, response) {
	    toggle = true;
	};
	routing.executeView(null, null, view, [null]);
	assert.ok(toggle);
    },

    'compileRouteTable': function (assert) {
	var routes = [["/pirate/treasure", 1], ["/?/bounty", 2]];
	assert.eql([[/^\/pirate\/treasure/, 1],
		    [/^\/([^\/]+)\/bounty$/, 2]],
		   routing.compileRouteTable(routes));
    },
}


var separator = /^[\s\/]+|[\s\/]+$/g;

module.exports = function (options) {
	options = options || {};
	if (typeof options.db === 'undefined') {
		throw new Error('Required option `db` missing');
	}

	/* instaceof Binary hack */
	var bson = require('mongodb/node_modules/bson');
	bson.Binary = options.db.bsonLib.Binary;
	/* /instaceof Binary hack */

	var mongodb = require('mongodb');

	return function gridfsMiddleware(req, res, next) {
		if (req.method !== 'GET' && req.method !== 'HEAD') {
			return next();
		}
		if (options.db.openCalled) {
			var filename = decodeURI(req.url).split('?', 1)[0].replace(separator, '');
			var gs = new mongodb.GridStore(options.db, filename, 'r');
			gs.open(function gridfsOnOpen(err, gs) {
				if (err) {
					return next();
				}
				res.setHeader('Content-Type', gs.contentType);
				res.setHeader('Content-Length', gs.length);
				if (req.method === 'GET') {
					var stream = gs.stream(true);
					stream.pipe(res);
				} else {
					gs.close();
					res.end();
				}
			});
		} else {
			next();
		}
	}
};
/*!
 * ECT CoffeeScript template engine v0.0.2
 * https://github.com/baryshev/connect-gridfs
 *
 * Copyright 2013, Vadim M. Baryshev <vadimbaryshev@gmail.com>
 * Licensed under the MIT license
 * https://github.com/baryshev/connect-gridfs/LICENSE
 */
var separator = /^[\s\/]+|[\s\/]+$/g;

module.exports = function (options) {
	options = options || {};
	if (typeof options.db === 'undefined') {
		throw new Error('Required MongoDB database instance is missing');
	}
	if (!options.db.openCalled) {
		throw new Error('MongoDB database instance should be opened');
	}

	var db = options.db;
	var zlib = null;
	var gzip = false;
	var gzipOptions = null;
	var gzipMimeTypes = null;
	var gzipMinLength = null;

	if (options.gzip) {
		gzip = true;
		zlib = require('zlib');
		if (typeof options.gzip === 'object') {
			if (options.gzip.mimeTypes) {
				gzipMimeTypes = {};
				for (var i = 0; i < options.gzip.mimeTypes.length; i++) {
					gzipMimeTypes[options.gzip.mime[i]] = true;
				}
				delete(options.gzip.mimeTypes);
			}
			if (options.gzip.minLength) {
				gzipMinLength = options.gzip.minLength;
				delete(options.gzip.minLength);
			}
			gzipOptions = options.gzip;
		}
	}

	/* instaceof Binary hack */
	var bson = require('mongodb/node_modules/bson');
	bson.Binary = db.bsonLib.Binary;
	/* /instaceof Binary hack */

	var mongodb = require('mongodb');

	return function gridfsMiddleware(req, res, next) {
		if (req.method !== 'GET' && req.method !== 'HEAD') {
			return next();
		}
		var filename = decodeURI(req.url).split('?', 1)[0].replace(separator, '');
		var gs = new mongodb.GridStore(db, filename, 'r');
		gs.open(function gridfsOnOpen(err, gs) {
			if (err) {
				return next();
			}
			res.setHeader('Content-Type', gs.contentType);
			if (req.method === 'GET') {
				var stream = gs.stream(true);
				if (gzip && (!gzipMinLength || gzipMinLength <= gs.length) && (!gzipMimeTypes || gzipMimeTypes[gs.contentType])) {
					res.setHeader('Content-Encoding', 'gzip');
					stream.pipe(zlib.createGzip(gzipOptions)).pipe(res);
				} else {
					res.setHeader('Content-Length', gs.length);
					stream.pipe(res);
				}
			} else {
				res.setHeader('Content-Length', gs.length);
				gs.close();
				res.end();
			}
		});
	}
};
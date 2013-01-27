# connect-gridfs

[GridFS](http://www.mongodb.org/display/DOCS/GridFS) file server for Connect.

# Installation

	npm install connect-gridfs

#

# Usage

```js
var http = require('http');
var mongodb = require('mongodb');
var connect = require('connect');
var connectGridfs = require('connect-gridfs');

var app = connect();
var server = http.createServer(app);

var db = new mongodb.Db('test', new mongodb.Server('127.0.0.1', 27017, { auto_reconnect: true }), { w: 1 });
db.open(function(err) {
	app.use('/public/', connectGridfs({ db : db }));
	server.listen(3000);
});
```
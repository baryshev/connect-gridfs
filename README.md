# connect-gridfs

[GridFS](http://www.mongodb.org/display/DOCS/GridFS) file server for Connect.

## Installation

	npm install connect-gridfs

## Options

  - `db` — previously opened MongoDB Db instance
  - `gzip` — `object` with gzip compression settings or `true` for default gzip settings, defaulting to `false` (gzipping disable)

### gzip options

[Native gzip options](http://zlib.net/manual.html#Advanced):

  - `chunkSize`
  - `windowBits`
  - `level`
  - `memLevel`
  - `strategy`
  - `dictionary`

Additional gzip options:

  - `minLength` — sets the minimum length of a response that will be gzipped, all responses gzipping by default
  - `mimeTypes` — enables gzipping of responses for the specified MIME types, all responses gzipping by default

## Example

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
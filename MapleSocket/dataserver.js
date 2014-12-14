var http = require('http'), fs = require('fs'), path = require('path');

var document = 'F:/HaRepacker/sauce/Decrypt/bin/x86/Debug/XML_Dumps/Dump_220812_11-12-2014';

var server = http.createServer(function(req, res) {
  console.log('Got HTTP req');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  var url = require('url').parse(req.url, true);

  if (url.pathname.indexOf('../') !== -1) {
    res.writeHead(400);
    res.end('Wrong path: ' + req.url);
    return;
  }

  var filePath = path.join(document, url.pathname);
  var stat;
  try {
    stat = fs.statSync(filePath);
  } catch (ex) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  if (!stat.isFile()) {
    if (stat.isDirectory() && url.query['contents']) {
      var files = fs.readdirSync(filePath);
      res.writeHead(200, {
        'Content-Type' : 'application/json'
      });
      res.end(JSON.stringify(files));
      return;

    }
    res.writeHead(404);
    res.end("Not a file");
  } else {
    res.writeHead(200, {
      'Content-Type' : 'application/xml',
      'Content-Length' : stat.size
    });

    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  }
});

server.listen(8081, function() {
  console.log('Listening...');
});

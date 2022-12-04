const fs = require('fs');
require.extensions['.css'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

const express = require('express');
const http = require('http');
const https = require('https');

const path = require('path');
const requestIp = require('request-ip');

const readConfig = require('./readConfig');

const errors = require('./errors');
global.errors = errors;

const mode = process.env.NODE_ENV || 'production';

let server = express();

server.get('/health_check', (req, res) => res.json({health: 'OK'}));
server.get('/', (req, res) => res.sendFile(path.join(__dirname, './public', 'index.html')));

server.use(express.static(path.join(__dirname, 'public')));

server.set('views', __dirname + '/views');
server.set('view engine', 'ejs');
server.engine('html', require('ejs').renderFile);

server.use(requestIp.mw());

readConfig(server);

const middleware = require('./middleware');

middleware(server).then(() => {
  const port = process.env.PORT || server.config.server.port || 8087;

  if(server.config.secureOptions && server.config.secureOptions.pfx) {
    const {
      pfx,
      passphrase
    } = server.config.secureOptions;

    const options = {
      pfx: fs.readFileSync(__dirname + pfx),
      passphrase
    };

    server.http_server = https.createServer(options, server);
    console.log(`Server Listen ${port} (secure)`);
  } else  if(server.config.secureOptions && server.config.secureOptions.cert) {
    const {
      key,
      cert
    } = server.config.secureOptions;

    const options = {
      key: fs.readFileSync(__dirname + key),
      cert:  fs.readFileSync(__dirname + cert)
    };

    server.http_server = https.createServer(options, server);
    console.log(`Server Listen ${port} (secure)`);
  } else {
    server.http_server = http.createServer(server);
    console.log(`Server Listen ${port}`);
  }

  server.http_server.setTimeout(1000 * 60 * 10); // Timeout 10분설정
  server.http_server.listen(port, '0.0.0.0');

  //scheduler on
  global.worker = server.config.scheduler.on ? require('./worker/scheduler') : { works: [] };
  global.worker && global.worker.start && global.worker.start(server.config.scheduler.works);

}).catch((e) => {
  console.log('@@@e', e);
  process.exit(-1);
});

server.exit = (i) => {
  server.http_server.close(()=>console.log('http_server closed'))
  console.log('server shuts down');
  process.exit(i);
};

process.on('SIGTERM', () => {
  server.exit(0);
});

module.exports = server;
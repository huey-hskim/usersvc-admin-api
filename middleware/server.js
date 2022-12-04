const express = require('express');
const hpp = require('hpp');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');
const logs = require('./logs');

module.exports = (server) => {
  server.disable('x-powered-by');
  server.use(bodyParser.json({limit: '100mb'}));
  server.use(bodyParser.urlencoded({limit: '100mb', extended: false}));
  server.use(bodyParser.raw());
  server.use(bodyParser.text());
  server.use(hpp());

  server.use(cookieParser());
  server.use(compression());

  server.use(logs('[:date[clf]] :method :url :status :res[content-length] - :response-time ms :id | :realip'));

  server.use('/downloads', express.static(path.join(__dirname, '../downloads')));
};
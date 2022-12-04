const morgan = require('morgan');
const red = '\x1B[31m',
  green = '\x1B[32m',
  yellow = '\x1B[33m',
  cyan = '\x1B[36m',
  white = '\x1B[37m',
  endColor = '\033[0m';

morgan.token('status', function (req, res) {
  let color;

  if (res.statusCode < 300) color = green;
  else if (res.statusCode < 400) color = cyan;
  else if (res.statusCode < 500) color = yellow;
  else if (res.statusCode < 600) color = red;
  else color = white;

  return color + res.statusCode + endColor;
});

morgan.token('realip', function (req, res) {
  return req.headers['x-real-ip'] || req.headers['x-forwarded-for'] ||req.connection.remoteAddress;
});

morgan(function (tokens, req, res) {
  return [
    tokens.realip(req, res),
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
});

// // Create a token for request body
morgan.token('body', function (req, res) {
  return white + 'body: ' + JSON.stringify(req.body) + endColor;
});

morgan.token('id', function (req, res) {
  let admin_no, user_no;

  if (req.admin) {
    admin_no = req.admin.admin_no;
  }

  if (req.user) {
    user_no = req.user.user_no;
  }

  if (admin_no) {
    return ' | admin_no:'+admin_no;
  } else if (user_no) {
    return ' | user_no:'+user_no;
  } else {
    return '';
  }
});

// console.log_orig = console.log;
// console.log = (...args) => {
//   console.log_orig(`[${(new Date()).toISOString()}]`, ...args);
// };

module.exports = morgan;
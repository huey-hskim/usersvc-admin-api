const path = require('path');
// const mime = require('mime');
const responseWrapper = (req, res, next) => {
  if (res._processed) {
    if (res.skipped) {
      return res;
    } else if (res.html) {
      return res.send(res.html);
    } else if (res.jsonobj) {
      return res.status(200).json(res.jsonobj);
    } else {
      return res.status(200).json({
        status: 200,
        code: 200,
        // type: 'OK',
        // message: res.message || 'OK',
        data: res.payload === undefined ? null : res.payload
      });
    }
  }
  const code = res.statusCode !== 200 ? res.statusCode : 404;
  return res.status(code).json({
    status: code,
    code: code,
    // type: 'FAIL',
    // message: res.message || 'FAIL',
    data: res.payload === undefined ? null : res.payload
  });
};

module.exports = (server) => {
  server.use(responseWrapper);
};
const CommonError = require('../errors/CommonError')

const captureException = (err, req) => {
  if (err instanceof CommonError) {
    const code = Number(err.code) || 0;
    if (code < 500 || 599 < code) {
      return;
    }
  }
};


const errorHandler = (err, req, res, next) => {
  if (err) {
    console.error(err);
    captureException(err, req);

    const status = Number(err.code) > 599 ? 500 : Number(err.code) || 500;
    return res.status(status).json({
      code: status,
      type: 'FAIL',
      message: err.message || err.name,
      error: err.data || err.toJSON ? err.toJSON(process.env.NODE_ENV === 'development') : err
    });
  }

  return res.status(200).json({
    code: 200,
    type: 'OK',
    message: 'OK',
    data: res.data || null
  });
};

module.exports = (server) => {
  server.use(errorHandler);
};

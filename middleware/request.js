const i18n = require('i18n');
const cors = require('cors');

const headerHandler = (req, res, next) => {
  req.setLocale(req.get('x-accept-language') || 'ko');
  req.apiVersion = req.get('x-api-version') ? req.get('x-api-version').toLowerCase() : '1.0';

  next();
};

module.exports = (server) => {
  i18n.configure({
    locales: ['ko', 'en'],
    defaultLocale: 'ko',
    objectNotation: false,
    directory: __dirname + '/../locales',
    indent: '  ',
    syncFiles: true,
    register: global
  });

  // set cors
  const corsWhitelist = server.config.cors_white_list || [];

  const corsOptions = {
    origin: function (origin, callback) {
      callback(null, corsWhitelist);
    },
    credentials: true
  };

  server.use(cors(corsOptions));

  server.use((req, res, next) => {

    const origin = req.headers.origin || req.headers.referer;

    if (corsWhitelist.includes(origin)) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      // res.header('Access-Control-Allow-Credentials', true);
      res.header('Vary', 'Origin');
      // req.cookieOptions = {sameSite: 'none', secure: true};

      // console.log(`!WRN cross-origin (${corsWhitelist})=(${req.headers.origin},${req.headers.referer})`);
    }

    next();
  });
  // end of set cors

  server.use(i18n.init);
  server.use(headerHandler);
};
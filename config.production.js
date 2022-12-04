module.exports = {
  mode: 'production',
  server: {
    host: '127.0.0.1',
    port: 8087,
    bind: 8087,
  },
  secureOptions: {
    pfx: '',
    passphrase: '',
    cert: '',
    key: '',
  },
  cors_white_list: [],
  apphome: {
    home: '',
    error: '',
  },
  scheduler: {
    on: false,
    works: '',
  },
  timezone: 'Asia/Seoul',
  database: {
    'mysql': {
      'Master': {
        host : 'localhost',
        port : '3306',
        user : 'usersvc_user',
        password : 'usersvc_pass12#',
        database:'usersvc',
        connectionLimit: 100,
        supportBigNumbers: true,
        dateStrings:true,
        charset: 'utf8mb4',
      },
    },
    'mongodb': {
      'Master': {
        host: 'localhost',
        port: 27017,
        database:'usersvc',
        user: 'usersvc_user',
        password: 'usersvc_pass34!',
      },
    },
  },
};

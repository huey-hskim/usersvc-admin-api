const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { Config } = require('../../../usersvc-common/constant/consts');
const crypto = require("crypto");

const checkStrongPasswd = (passwd) => {
  // //소문자,대문자,숫자,특수문자 반드시 포함.
  // let strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{7,})');

  //영문,숫자 반드시 포함.
  let strongRegex = new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])(?=.{7,})');

  return strongRegex.test(passwd);
};

module.exports = {

  checkStrongPasswd: checkStrongPasswd,

  compare: async (text1, text2) => {
    return bcrypt.compareSync(text1, text2);
  },

  makeRandomPasswd: (len=9) => {
    len = Math.min(len,20);
    return 'Mi6'+crypto.randomBytes(20).toString('base64').substring(0, len).replaceAll('/','#');
  },

  passwdHash: async (passwd) => {

    if (!checkStrongPasswd(passwd)) {
      return null;
    }

    return bcrypt.hashSync(passwd, bcrypt.genSaltSync(10)) || null;
  },

  tokenHash: async (str) => {
    const hash = crypto.createHash('md5')
      .update(str + 'AUTH##ehRo3lskfk')
      .update(crypto.randomBytes(8).toString('base64').substring(0, 8))
      .digest('hex');

    return hash;
  },

  makeAccessToken: async (admin = {admin_no, hash, ttl}) => {
    let {
      admin_no,
      hash,
      ttl
    } = admin;

    if(!admin_no || !hash) {
      return null;
    }

    ttl = ttl || Config.SESSION_EXPIRES_SEC;

    let data = {
      admin_no,
      hash,
    };

    return jwt.sign(data, Config.ADMSECRET_SESSION, { algorithm: 'HS256', expiresIn: ttl });
  },

  makeRefreshToken: async (admin = {admin_no, hash, ttl}) => {
    let {
      admin_no,
      hash,
      ttl
    } = admin;

    if(!admin_no || !hash) {
      return null;
    }

    ttl = ttl || Config.REFRESH_EXPIRES_SEC;

    let data = {
      hash,
      rftm: (new Date()).getTime() + 86400000,
    };

    return jwt.sign(data, Config.ADMSECRET_REFRESH, { algorithm: 'HS256', expiresIn: ttl });
  },

};
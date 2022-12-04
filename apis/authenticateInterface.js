const jwt = require('jsonwebtoken');

class AuthenticateInterface {
  constructor() {
  }

  optional(req, res, next) {
    req.optional = true;
  }

  tokenDecode(token, key) {
    let decoded = null;
    try {
      decoded = jwt.decode(token, key);
    } catch (e) {
    }
    return decoded;
  }

  tokenVerify(token, key) {
    let decoded = null;
    try {
      decoded = jwt.verify(token, key);
    } catch (e) {
      throw new global.errors.ExpiredTokenError(__('토큰이 만료되었습니다.'));
    }
    return decoded;
  }

  async authenticate(req, res, next) {
    await this.onPassport(req, res, next);
    if (!req.optional) {
      await this.onRequired(req, res, next);
    }
  }

  async onPassport(req, res, next) {
  }

  async onRequired(req, res, next) {
    // req.admin 를 체크한다. 만약 다른경우는 상속받아 별도 처리하자.
    if (!req.admin) {
      throw new global.errors.UnauthorizedError(__('인증되지 않았습니다.'));
    }
  }
}

module.exports = AuthenticateInterface;
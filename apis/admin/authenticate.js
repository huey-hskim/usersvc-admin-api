const {Config, Settings} = require('../../usersvc-common/constant/consts');
const AuthenticateInterface = require('../authenticateInterface');

class Authenticate extends AuthenticateInterface {
  constructor() {
    super();
  }

  async onPassport(req, res, next) {
    const token = req.get('Authorization');
    if (!token) {
      return;
    }

    const bearer = token.replace("Bearer ", '');
    let decoded = this.tokenVerify(bearer, Config.ADMSECRET_SESSION);
    if (!decoded || decoded.admin_no === null || decoded.admin_no === undefined) {
      return;
    }

    req.admin = {
      ...decoded
    };
  }
}

module.exports = Authenticate;
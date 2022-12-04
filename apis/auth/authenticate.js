const { Config } = require('../../usersvc-common/constant/consts');
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

    // refresh token check
    if (req.url === '/refresh') {
      const refreshToken = req.get('RefreshToken');

      let decoded_refresh = this.tokenVerify(refreshToken, Config.ADMSECRET_REFRESH);
      if (!decoded_refresh || !decoded_refresh.hash) {
        return;
      }

      const bearer = token.replace("Bearer ", '');
      let decoded = this.tokenDecode(bearer, Config.ADMSECRET_SESSION);

      req.admin = {
        ...decoded_refresh,
        admin: {...decoded},
      }

      return;
    }

    const bearer = token.replace("Bearer ", '');
    let decoded = this.tokenVerify(bearer, Config.ADMSECRET_SESSION);
    if (!decoded || !decoded.admin_no) {
      return;
    }

    req.admin = {
      ...decoded
    };
  }
}

module.exports = Authenticate;
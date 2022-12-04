const CommonError = require('../CommonError');

class ExpiredTokenError extends CommonError {
  constructor(props) {
    super(props);

    this.name = ExpiredTokenError.name;
    this.code = 401;
  }
}

module.exports.ExpiredTokenError = ExpiredTokenError;
const CommonError = require('../CommonError');

class InvalidAuthorizedTokenError extends CommonError {
  constructor(props) {
    super(props);

    this.name = InvalidAuthorizedTokenError.name;
    this.code = 401;
  }
}

module.exports.InvalidAuthorizedTokenError = InvalidAuthorizedTokenError;

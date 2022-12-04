const CommonError = require('../CommonError');

class UnauthorizedError extends CommonError {
  constructor(props) {
    super(props);

    this.name = UnauthorizedError.name;
    this.code = 401;
  }
}

module.exports.UnauthorizedError = UnauthorizedError;
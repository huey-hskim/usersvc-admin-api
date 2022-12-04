const CommonError = require('../CommonError');

class ForbiddenError extends CommonError {
  constructor(props) {
    super(props);

    this.name = ForbiddenError.name;
    this.code = 403;
  }
}

module.exports.ForbiddenError = ForbiddenError;
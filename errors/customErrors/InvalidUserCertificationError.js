const CommonError = require('../CommonError');

class InvalidUserCertificationError extends CommonError {
  constructor(props) {
    super(props);

    this.name = InvalidUserCertificationError.name;
    this.code = 400;
    return this;
  }
}

module.exports.InvalidUserCertificationError = InvalidUserCertificationError;


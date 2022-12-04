const CommonError = require('../CommonError');

class InternalServerError extends CommonError {
  constructor(props) {
    super(props);

    this.name = InternalServerError.name;
    this.code = 500;
  }
}

module.exports.InternalServerError = InternalServerError;
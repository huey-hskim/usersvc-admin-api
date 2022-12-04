const CommonError = require('../CommonError');

class BadRequestError extends CommonError {
  constructor(props) {
    super(props);

    this.name = BadRequestError.name;
    this.code = 400;
  }
}

module.exports.BadRequestError = BadRequestError;
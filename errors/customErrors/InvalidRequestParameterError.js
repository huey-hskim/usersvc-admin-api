const CommonError = require('../CommonError');

class InvalidRequestParameterError extends CommonError {
  constructor(props) {
    super(props);

    this.name = InvalidRequestParameterError.name;
    this.code = 400;
  }
}

module.exports.InvalidRequestParameterError = InvalidRequestParameterError;
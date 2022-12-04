const CommonError = require('../CommonError');

class InvalidDatabaseParameterError extends CommonError {
  constructor(props) {
    super(props);

    this.name = InvalidDatabaseParameterError.name;
    this.code = 400;
  }
}

module.exports.InvalidDatabaseParameterError = InvalidDatabaseParameterError;
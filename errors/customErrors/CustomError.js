const CommonError = require('../CommonError');

class CustomError extends CommonError {
  constructor(props) {
    super(props);

    this.name = CustomError.name;
    this.code = 500;
  }
}

module.exports.CustomError = CustomError;

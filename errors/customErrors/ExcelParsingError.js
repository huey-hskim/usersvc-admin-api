const CommonError = require('../CommonError');

class ExcelParsingError extends CommonError {
  constructor(props) {
    super(props);

    this.name = ExcelParsingError.name;
    this.code = 400;
    return this;
  }
}

module.exports.ExcelParsingError = ExcelParsingError;
const CommonError = require('../CommonError');

class NotExistAdminError extends CommonError {
  constructor(props) {
    super(props);

    this.name = NotExistAdminError.name;
    this.code = 400;
    return this;
  }
}

module.exports.NotExistAdminError = NotExistAdminError;


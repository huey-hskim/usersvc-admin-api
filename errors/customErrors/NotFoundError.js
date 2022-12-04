const CommonError = require('../CommonError');

class NotFoundError extends CommonError {
  constructor(props) {
    super(props);

    this.name = NotFoundError.name;
    this.code = 404;
  }
}
module.exports.NotFoundError = NotFoundError;


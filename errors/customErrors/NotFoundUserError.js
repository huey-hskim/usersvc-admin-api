const CommonError = require('../CommonError');

class NotFoundUserError extends CommonError {
  constructor(props) {
    super(props);

    this.name = NotFoundUserError.name;
    this.code = 400;
    return this;
  }
}
module.exports.NotFoundUserError = NotFoundUserError;


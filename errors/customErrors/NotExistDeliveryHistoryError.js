const CommonError = require('../CommonError');

class NotExistDeliveryHistoryError extends CommonError {
  constructor(props) {
    super(props);

    this.name = NotExistDeliveryHistoryError.name;
    this.code = 400;
    return this;
  }
}

module.exports.NotExistDeliveryHistoryError = NotExistDeliveryHistoryError;


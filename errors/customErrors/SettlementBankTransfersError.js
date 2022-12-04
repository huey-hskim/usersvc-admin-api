const CommonError = require('../CommonError');

class SettlementBankTransfersError extends CommonError {
  constructor(props) {
    super(props);

    this.name = SettlementBankTransfersError.name;
    this.code = 600;
    return this;
  }
}

module.exports.SettlementBankTransfersError = SettlementBankTransfersError;
const _         = require('lodash');
const fs        = require('fs');

const makedir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  return dir;
};

const replaceObjectValue = (obj = {}, values = []) => {
  if (!obj || !values || !values.length) return obj;

  const keys = Object.keys(obj);

  for (let o of keys) {
    if (typeof obj[o] === 'object') {
      replaceObjectValue(obj[o], values);
    } else {
      if (obj[o]) {
        for (let v of values) {
          if (v.length > 1) {
            if (typeof v[1] === 'string') {
              if (typeof obj[o] === 'string' && obj[o].includes(v[0])) {
                obj[o] = obj[o].replace(v[0], v[1]);
              }
            } else {
              if (obj[o] === v[0]) {
                obj[o] = v[1];
              }
            }
          }
        }
      }
    }
  }

  return obj;
}

// condition
// [] = and
// {} = or
// [{msg: "success", code: 0}, {logReason: 20000}] ==> ((o.msg === 'success' || o.code == 0 ) && (o.logReason == 200000))
// [{status: 200}, {'payload.errcode': 0}] ==> ((o.status == 200) && (o.payload.errcode == 0))
const _checkResponseCondition = (receivedResponse, condition) => {
  let isTrue;

  //check success condition
  // [] = and
  // {} = or
  if (Array.isArray(condition)) {
    isTrue = true;
    for (let a of condition) {
      isTrue = _checkResponseCondition(receivedResponse, a);
      if (!isTrue) {    // and는 하나라도 false면 false
        break;
      }
    }
  } else if (typeof condition === 'object') {
    isTrue = false;
    let keys = Object.keys(condition);
    for (let o of keys) {
      if (typeof condition[o] === 'object') {
        isTrue = _checkResponseCondition(receivedResponse, condition[o]);
      } else {
        isTrue = (_.get(receivedResponse, o) === condition[o]);
      }
      if (isTrue) {   // or는 하나라도 true면 true
        break;
      }
    }
  } else {  // 여기까지 안온다. condition은 array 또는 object이고 리프노드는 object로 감싼다.
    return false;
  }

  return isTrue;
}

const pickReturnData = (output, receivedResponse, data) => {
  if (data) {
    let keys = Object.keys(data);
    for (let k of keys) {
      output.data[k] = _.get(receivedResponse, data[k]);
    }
  }
}

//retcode
//  1: success
//  0: pending
// -1: error
// data
// {jobID: "jobID"} ==> return {jobID: o["jobID"]}
// outout
// { retcode, data }
const checkResponse = (receivedResponse = {}, expectedResponse = {success:{condition:[{}],data:{}}, pending:{}, error:{}}) => {
  let output = {
    retcode: -1,
    data: {}
  }

  if (!receivedResponse || !expectedResponse) return output;

  if (_checkResponseCondition(receivedResponse, expectedResponse.success.condition)) {
    output.retcode = 1;
    pickReturnData(output, receivedResponse, expectedResponse.success.data);
  } else if (_checkResponseCondition(receivedResponse, expectedResponse.pending.condition)) {
    output.retcode = 0;
    pickReturnData(output, receivedResponse, expectedResponse.pending.data);
  } else {
    output.retcode = -1;
    pickReturnData(output, receivedResponse, expectedResponse.error.data);
  }

  return output;
}

module.exports = {
  makedir: makedir,
  replaceObjectValue: replaceObjectValue,
  checkResponse: checkResponse,
};
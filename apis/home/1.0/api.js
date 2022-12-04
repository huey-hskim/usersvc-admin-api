const { ErrorCode } = require('../../../usersvc-common/constant/consts');
const daoSvc = require('../../../usersvc-common/dao/usersvc');
const daoHome = require('./dao');

module.exports = {
  getSummary: async (req, res) => {
    // Response
    let output = {
      errCode: ErrorCode.unknown,
      data: null
    };

    try {

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      const queryOptions = {};

      queryOptions.whereCustomQueryOnly = 1;
      queryOptions.whereCustomQuery = '1 = 1';
      queryOptions.orderBy = 'stat_tm desc';
      queryOptions.limit = 2;

      result = await daoSvc.stat_curr_dashboard.select(conn, {}, queryOptions);

      if (!result) {
        output.errCode = ErrorCode.User.notFoundUser;
        throw new Error();
      }

      const data = {};

      data.stat_tm                 = result[0].stat_tm;
      data.visit_user              = result[0].visit_user;
      data.visit_diff              = result[0].visit_user - result[1].visit_user;
      data.inquiry_unresolved      = result[0].inquiry_unresolved;
      data.subscription_total      = result[0].subscription_total;
      data.subscription_diff       = result[0].subscription_total - result[1].subscription_total;

      output.errCode = ErrorCode.success;
      output.data = data;

    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    }
  },

  getUsersStats: async (req, res) => {
    // Response
    let output = {
      errCode: ErrorCode.unknown,
      list: [],
    };

    try {

      const {
        basis,
        start_date,
        end_date
      } = req.query;

      if (!basis || !start_date || !end_date) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      result = await daoHome.selectStats(conn, {basis, start_date, end_date});

      if (!result) {
        output.errCode = ErrorCode.User.notFoundUser;
        throw new Error();
      }

      const list = [];

      for(let dat of result) {
        const form = {};
        form.stat_tm            = dat.stat_tm;
        form.user_total         = dat.user_total;
        form.subscription_total = dat.subscription_total;

        list.push(form);
      }

      output.errCode = ErrorCode.success;
      output.list = list;

    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    }
  },

  getSalesStats: async (req, res) => {
    // Response
    let output = {
      errCode: ErrorCode.unknown,
      list: [],
    };

    try {

      const {
        basis,
        start_date,
        end_date
      } = req.query;

      if (!basis || !start_date || !end_date) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      result = await daoHome.selectStats(conn, {basis, start_date, end_date});

      if (!result) {
        output.errCode = ErrorCode.User.notFoundUser;
        throw new Error();
      }

      const list = [];

      // 구독 외 매출 있으면 더해 주기..
      for(let dat of result) {
        const form = {};
        form.stat_tm              = dat.stat_tm;
        form.sales_total          = dat.subscription_total;
        form.sales_subscription   = dat.subscription_total;

        list.push(form);
      }

      output.errCode = ErrorCode.success;
      output.list = list;

    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    }
  },

}
const daoSvc = require('../../../usersvc-common/dao/usersvc');

module.exports = {
  selectStats: async (conn, { basis, start_date, end_date }) => {

    let result = [];

    const queryOptions = {};

    queryOptions.whereCustomQueryOnly = 1;
    queryOptions.whereCustomQuery     = 'stat_tm >= ? and stat_tm <= ?';
    queryOptions.orderBy              = 'stat_tm asc';

    if (basis === 'hour') {
      const start = start_date + ' 00:00:00';
      const end   = end_date + ' 23:59:59';

      queryOptions.whereCustomParams    = [start, end];

      result = await daoSvc.stat_hour_dashboard.select(conn, {}, queryOptions);
    }

    if (basis === 'day') {
      const start = start_date;
      const end   = end_date;

      queryOptions.whereCustomParams    = [start, end];

      result = await daoSvc.stat_day_dashboard.select(conn, {}, queryOptions);
    }

    if (basis === 'month') {
      const start = start_date.substring(0, 7);
      const end   = end_date.substring(0, 7);

      queryOptions.whereCustomParams    = [start, end];

      result = await daoSvc.stat_month_dashboard.select(conn, {}, queryOptions);
    }

    if (basis === 'year') {
      const start = start_date.substring(0, 4);
      const end   = end_date.substring(0, 4);

      queryOptions.whereCustomParams    = [start, end];

      result = await daoSvc.stat_year_dashboard.select(conn, {}, queryOptions);
    }

    return result;
  },
};
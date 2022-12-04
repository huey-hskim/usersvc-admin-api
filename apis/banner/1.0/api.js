const _ = require('lodash');

const { ErrorCode } = require('../../../usersvc-common/constant/consts');

const daoSvc = require('../../../usersvc-common/dao/usersvc');

module.exports = {
  getList: async (req, res) => {
    //response data
    let output = {
      errCode: ErrorCode.unknown,
      list: [],
      totalCnt: 0,
    };

    try {
      const {
        btype,
      } = req.params;

      if (!btype) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      const {
        q,
        page,
      } = req.query;

      let {
        limit,
      } = req.query;

      limit = limit || 100;

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      const dao = daoSvc.banner_tbl;

      if (!dao) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      let queryOptions = {page, limit, orderBy: ' no desc '};

      // if (q) {
      //   queryOptions.whereCustomQueryOnly = 1
      //   queryOptions.whereCustomQuery = ` title like ? `;
      //   queryOptions.whereCustomParams = [];
      //   queryOptions.whereCustomParams.push(`%${q}%`);
      // }

      queryOptions.fieldsCustom = [ 'is_open' ];

      result = await dao.select(conn, {type: btype}, queryOptions);

      if (!result) {
      } else {
        let resultTotalCnt = await dao.total_cnt(conn, {type: btype}, queryOptions);

        output.totalCnt = resultTotalCnt.totalCnt;
      }

      output.errCode = ErrorCode.success;
      output.list = result;

    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    }
  },

  getItem: async (req, res) => {

    //response data
    let output = {
      errCode: ErrorCode.unknown,
      data: null
    };

    try {
      const {
        btype,
        bno,
      } = req.params;

      if (!btype || !bno) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      const dao = daoSvc.banner_tbl;

      if (!dao) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      result = await dao.select(conn, {type: btype, no: bno}, {firstObjOnly:1, fieldsEx:1});

      output.errCode = ErrorCode.success;
      output.data = result;

    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    }
  },

  addItem: async (req, res) => {
    //response data
    let output = {
      errCode: ErrorCode.unknown,
      bno: null,
    };

    try {
      const {
        btype,
      } = req.params;

      if (!btype) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      const {
        imgurl,
        linkurl,
        display_order,
        open_at,
        close_at,
        testers,
        is_open,
      } = req.body;

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      const dao = daoSvc.banner_tbl;

      if (!dao) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      await conn.startTransaction();

      result = await dao.insert(conn, {
        type: btype,
        imgurl,
        linkurl,
        display_order,
        open_at,
        close_at,
        testers,
        is_open,
        operator_no: req.admin.admin_no,
      });

      if (!result || result.errCode || !result.insertId) {
        result && (output = {...output, ...result});
        throw new Error();
      }

      output.errCode = ErrorCode.success;
      output.bno = result.insertId;

      await conn.commit();

    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    }
  },

  modItem: async (req, res) => {
    //response data
    let output = {
      errCode: ErrorCode.unknown
    };

    try {
      const {
        btype,
        bno,
      } = req.params;

      if (!btype || !bno) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      const {
        imgurl,
        linkurl,
        display_order,
        open_at,
        close_at,
        testers,
        is_open,
      } = req.body;

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      const dao = daoSvc.banner_tbl;

      if (!dao) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      await conn.startTransaction();

      result = await dao.update(conn, {
        no: bno,
        type: btype,
        imgurl,
        linkurl,
        display_order,
        open_at,
        close_at,
        testers,
        is_open,
        operator_no: req.admin.admin_no,
      });

      if (!result || result.errCode) {
        result && (output = {...output, ...result});
        throw new Error();
      }

      output.errCode = ErrorCode.success;

      await conn.commit();

    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    }
  },

  delItem: async (req, res) => {
    //response data
    let output = {
      errCode: ErrorCode.unknown
    };

    try {
      const {
        btype,
        bno,
      } = req.params;

      if (!btype || !bno) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      const dao = daoSvc.banner_tbl;

      if (!dao) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      await conn.startTransaction();

      result = await dao.delete(conn, {
        type: btype,
        no: bno,
        operator_no: req.admin.admin_no,
      });

      if (!result || result.errCode) {
        result && (output = {...output, ...result});
        throw new Error();
      }

      output.errCode = ErrorCode.success;

      await conn.commit();

    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    }
  },

};
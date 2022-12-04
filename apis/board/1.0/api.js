const _ = require('lodash');

const { ErrorCode } = require('../../../usersvc-common/constant/consts');

const daoSvc = require('../../../usersvc-common/dao/usersvc');
const funcAuth = require("../../auth/1.0/func");
const daoAuth = require("../../auth/1.0/dao");

module.exports = {
  getBoardList: async (req, res) => {
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

      const dao = daoSvc[`board_${btype}_tbl`];

      if (!dao) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      let queryOptions = {page, limit, orderBy: ' created_at desc, category, display_order ', fieldsEx:1};

      if (q) {
        queryOptions.whereCustomQueryOnly = 1
        queryOptions.whereCustomQuery = ` title like ? `;
        queryOptions.whereCustomParams = [];
        queryOptions.whereCustomParams.push(`%${q}%`);
      }

      // queryOptions.fieldsCustom = [ 'created_at', 'updated_at' ];

      result = await dao.select(conn, {}, queryOptions);

      if (!result) {
      } else {
        let resultTotalCnt = await dao.total_cnt(conn, {}, queryOptions);

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

  getBoardItem: async (req, res) => {

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

      const dao = daoSvc[`board_${btype}_tbl`];

      if (!dao) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      result = await dao.select(conn, {no: bno}, {firstObjOnly:1, fieldsEx:1});

      output.errCode = ErrorCode.success;
      output.data = result;

    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    }
  },

  addBoardItem: async (req, res) => {
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
        category,
        title,
        contents,
        testers,
        is_open,
        display_order,
        open_at,
        close_at,
      } = req.body;

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      const dao = daoSvc[`board_${btype}_tbl`];

      if (!dao) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      await conn.startTransaction();

      result = await dao.insert(conn, {
        category,
        title,
        contents,
        testers,
        is_open,
        display_order,
        open_at,
        close_at,
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

  modBoardItem: async (req, res) => {
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
        category,
        title,
        contents,
        testers,
        is_open,
        display_order,
        open_at,
        close_at,
      } = req.body;

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      const dao = daoSvc[`board_${btype}_tbl`];

      if (!dao) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      await conn.startTransaction();

      result = await dao.update(conn, {
        no: bno,
        category,
        title,
        contents,
        testers,
        is_open,
        display_order,
        open_at,
        close_at,
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

  delBoardItem: async (req, res) => {
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

      const dao = daoSvc[`board_${btype}_tbl`];

      if (!dao) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      await conn.startTransaction();

      result = await dao.delete(conn, {
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
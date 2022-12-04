const _ = require('lodash');
const crypto = require('crypto');

const { ErrorCode } = require('../../../usersvc-common/constant/consts');

const daoAdmin = require('./dao');
const apiAuth = require('../../auth/1.0/api');
const daoAuth = require('../../auth/1.0/dao');
const funcAuth = require('../../auth/1.0/func');

const daoSvc = require('../../../usersvc-common/dao/usersvc');

module.exports = {
  joinAdmin: async (req, res) => {
    //response data
    let output = {
      errCode: ErrorCode.unknown,
      // admin_no: null,
      // accessToken: null,
      // refreshToken: null,
    };

    try {
      const {
        id,
        passwd,
        admin_name,
        admin_phone,
        admin_rank,
        user_no,
        comments,
      } = req.body;

      //result of function call
      let result;

      //check leaked passwd
      result = funcAuth.checkStrongPasswd(passwd);
      if (!result) {
        output.errCode = ErrorCode.Auth.leakedPasswd;
        throw new Error();
      }

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      await conn.startTransaction();

      result = await daoSvc.admin_tbl.insert(conn, {
        id,
        operator_no: req.admin.admin_no,
      });

      if (!result || result.errCode || !result.insertId) {
        result && (output = {...output, ...result});
        throw new Error();
      }

      let admin_no = result.insertId;

      //set admin passwd
      if (admin_no) {
        result = await daoAuth.setAdminPasswd(conn, {admin_no, passwd});

        if (!result || result.errCode) {
          result && (output = {...output, ...result});
          throw new Error();
        }
      }

      result = await daoSvc.admin_info_tbl.insert(conn, {
        admin_no,
        admin_name,
        admin_phone,
        admin_rank,
        user_no,
        comments,
        operator_no: req.admin.admin_no,
      });

      if (!result || result.errCode) {
        result && (output = {...output, ...result});
        throw new Error();
      }

      // // join 후 바로 로그인
      // let res_payload = {payload: null};
      // await apiAuth.login({body: {id, passwd}, getDBConn: req.getDBConn}, res_payload);
      //
      output.errCode = ErrorCode.success;
      output.admin_no = admin_no;
      // output.accessToken = res_payload.payload.accessToken;
      // output.refreshToken = res_payload.payload.refreshToken;

      await conn.commit();

    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    }
  },

  getAdmin: async (req, res) => {

    //response data
    let output = {
      errCode: ErrorCode.unknown,
      data: null
    };

    try {
      // const {
      //   admin_no
      // } = req.admin;
      //
      // let {
      //   admin_no: q_admin_no
      // } = req.params;


      let admin_no;

      if (req.url.startsWith('/admins')) {
        admin_no = req.params.admin_no;
      } else {
        admin_no = req.admin.admin_no;
      }

      if (!admin_no) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error();
      }

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      result = await daoSvc.admin_info_tbl.select(conn, { admin_no }, {fieldsEx:1});

      if (!result) {
        output.errCode = ErrorCode.User.notFoundUser;
        throw new Error();
      }

      output.errCode = ErrorCode.success;
      output.data = result;

    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    }
  },

  modifyAdmin: async (req, res) => {
    //response data
    let output = {
      errCode: ErrorCode.unknown
    };

    try {
      // const {
      //   admin_no
      // } = req.admin;

      let admin_no;

      if (req.url.startsWith('/admins')) {
        admin_no = req.params.admin_no;
      } else {
        admin_no = req.admin.admin_no;
      }

      if (!admin_no) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error();
      }

      let {
        admin_name,
        admin_phone,
        admin_rank,
        user_no,
        comments,
      } = req.body;

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      await conn.startTransaction();

      result = await daoSvc.admin_info_tbl.update(conn, {
        admin_no,
        admin_name,
        admin_phone,
        admin_rank,
        user_no,
        comments,
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

  leaveAdmin: async (req, res) => {
    //response data
    let output = {
      errCode: ErrorCode.unknown
    };

    try {
      // const {
      //   admin_no
      // } = req.admin;

      let admin_no;

      if (req.url.startsWith('/admins')) {
        admin_no = req.params.admin_no;
      } else {
        admin_no = req.admin.admin_no;
      }

      if (!admin_no) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error();
      }

      // let {
      //   reason,
      //   comments,
      // } = req.body;

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      await conn.startTransaction();

      result = await daoSvc.admin_tbl.select(conn, { no: admin_no }, {firstObjOnly:1});

      if (!result) {
        output.errCode = ErrorCode.User.notFoundUser;
        throw new Error();
      }

      result = await daoSvc.admin_tbl.delete(conn, { no: admin_no, operator_no: req.admin.admin_no });

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

  getAdminList: async (req, res) => {

    //response data
    let output = {
      errCode: ErrorCode.unknown,
      data: null
    };

    try {
      const {
        admin_no
      } = req.admin;

      let {
        q,
        page,
        limit,
        to_go,
        userjoinedonly,
      } = req.query;

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      // result = await daoAdmin.selectAdminList(conn, { q, page, limit });
      const queryOptions = {page,limit, whereCustomQuery: ''};

      if (to_go) {
        let prefix = '';
        let postfix = '';

        if (to_go.startsWith(',')) prefix = '0';
        if (to_go.endsWith(',')) postfix = '0';

        queryOptions.whereCustomQuery = ` and user_no in ( ${prefix}${to_go}${postfix} ) `;
        // whereCustomParams.push(`!${prefix}${to_go}${postfix}`);
      } else if (q) {
        // queryOptions.whereCustomQueryOnly = 1

        q = `${q}%`;

        queryOptions.whereCustomQuery = `
        and ( admin_id like ?
           or admin_name like ?
           or admin_phone like ?
           or admin_no like ?
           )
      `;
        queryOptions.whereCustomParams = [q, q, q, q];
      }

      if (userjoinedonly) {
        queryOptions.whereCustomQuery += ' and user_no is not null ';
      }

      result = await daoSvc.admin_info_view.select(conn, {}, queryOptions);

      if (!result) {
        output.errCode = ErrorCode.User.notFoundUser;
        throw new Error();
      } else {
        let resultTotalCnt = await daoSvc.admin_info_view.total_cnt(conn, {}, queryOptions);

        output.totalCnt = resultTotalCnt.totalCnt;
      }

      output.errCode = ErrorCode.success;
      output.data = result;

    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    }
  },

};
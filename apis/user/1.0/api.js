const _ = require('lodash');
const crypto = require('crypto');

const { ErrorCode, Constants} = require('../../../usersvc-common/constant/consts');

const funcAuth = require('../../auth/1.0/func');

const mailer = require('../../../utils/mailer');

const daoSvc = require('../../../usersvc-common/dao/usersvc');

module.exports = {
  getList: async (req, res) => {
    //response data
    let output = {
      errCode: ErrorCode.unknown,
      list: [],
    };

    try {
      const {
        admin_no
      } = req.admin;

      const {
        status,
        created_dt,
        uname,
        phone,
        id,
        to_go,
      } = req.query;

      let {
        q,
        page,
        limit,
      } = req.query;

      limit = limit || 10;

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      const queryOptions = {page, limit, orderBy: ' created_at desc', includeDeleted:1};

      let commonQuery = ' status <> 0 ';
      let whereCustomParams = [];

      let statusQuery = '';
      let createdTimeQuery = '';
      let unameQuery = '';
      let phoneQuery = '';
      let idQuery = '';
      let to_goQuery = '';
      let integratedQuery = '';

      queryOptions.fieldsCustom = [
        'created_at', 'leaved_at', 'birthdate', 'gender',
      ];

      if (typeof to_go !== 'undefined') {
        if (to_go === ',,' || to_go === '') {
          output.errCode = ErrorCode.success;
          output.list = [];
          throw new Error();
        }

        let prefix = '';
        let postfix = '';

        if (to_go.startsWith(',')) prefix = '0';
        if (to_go.endsWith(',')) postfix = '0';

        to_goQuery = ` and user_no in ( ${prefix}${to_go}${postfix} ) `;
        // whereCustomParams.push(`!${prefix}${to_go}${postfix}`);
      } else if (q) {
        q = `${q}%`;
        integratedQuery = `
        and ( id like ?
           or uname like ?
           or phone like ?
           )
        `;
        whereCustomParams.push(q, q, q);
      } else {
        if (status) {
          let statuss = status.split(',');

          statusQuery = ` and status in ( ${statuss.map(() => '?').join(',')} ) `;
          whereCustomParams.push(...statuss);
        }

        if (created_dt) {
          if (created_dt.start) {
            createdTimeQuery += ' and created_at >= ? ';
            whereCustomParams.push(created_dt.start);
          }
          if (created_dt.end) {
            createdTimeQuery += ' and created_at <= ? ';
            whereCustomParams.push(created_dt.end);
          }
        }

        if (uname) {
          unameQuery = ' and uname = ?';
          whereCustomParams.push(uname);
        }

        if (phone) {
          phoneQuery = ' and phone = ?';
          whereCustomParams.push(phone);
        }

        if (id) {
          idQuery = ' and id like ?';
          whereCustomParams.push(`${id}%`);
        }
      }

      queryOptions.whereCustomQueryOnly = 1
      queryOptions.whereCustomQuery = ` 
        ${commonQuery}
        ${integratedQuery}
        ${statusQuery}
        ${createdTimeQuery} 
        ${unameQuery}
        ${phoneQuery}
        ${idQuery}
        ${to_goQuery} `;
      queryOptions.whereCustomParams = whereCustomParams;

      result = await daoSvc.user_info_view.select(conn, { }, queryOptions);

      if (!result) {
        output.errCode = ErrorCode.User.notFoundUser;
        throw new Error();
      } else {
        let resultTotalCnt = await daoSvc.user_info_view.total_cnt(conn, {}, queryOptions);

        output.totalCnt = resultTotalCnt.totalCnt;

        result = result.map((i) => {
          i.phone = i.phone && (`${i.phone.substring(0,3)}-**-${i.phone.substring(i.phone.length-4)}`);
          i.birthdate = i.birthdate && (`${i.birthdate.substring(0,4)}.${i.birthdate.substring(4,6)}`);
          i.uname = i.uname && (`${i.uname.substring(0,1)}*${i.uname.substring(i.uname.length-1)}`);

          if (i.status && i.leaved_at) {
            i.status = Constants.User.Status.deletePending;
          }
          return i;
        });
      }

      await daoSvc.admin_operation_log.insert(conn, {
        base_url: req.baseUrl,
        url: req.originalUrl,
        method: req.method,
        data: JSON.stringify({body: req.body, params: req.params, query: req.query}),
        comments: '',
        created_by: admin_no,
      });

      output.errCode = ErrorCode.success;
      output.list = result;

    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    }
  },

  getListTogo: async (req, res) => {
    //response data
    let output = {
      errCode: ErrorCode.unknown,
      list: null,
    };

    try {
      const {
        admin_no
      } = req.admin;

      const {
        to_go
      } = req.query;

      if (!to_go) {
        throw new Error();
      }



      output.errCode = ErrorCode.success;
      output.list = result;

    } catch (e) {
      // console.log(e);
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
        admin_no
      } = req.admin;

      const {
        user_no
      } = req.params;

      if (!user_no) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error();
      }

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      result = await daoSvc.user_info_view.select(conn, { user_no }, {firstObjOnly:1, fieldsEx:1});

      if (!result) {
        output.errCode = ErrorCode.User.notFoundUser;
        throw new Error();
      }

      let userData = result;

      //동의
      {
        let queryOptions = {};
        queryOptions.fieldsCustom = ['type', 'agreement', 'updated_at'];
        queryOptions.fieldsCustomOnly = 1;

        result = await daoSvc.user_agreement_tbl.select(conn, {user_no}, queryOptions);
        if (!result) {
          userData.agreement = [];
        } else {
          userData.agreement = result;
          // for (let l of result) {
          //   userData[l.type] = {agreement: l.agreement, updated_at: l.updated_at};
          // }
        }
      }

      await daoSvc.admin_operation_log.insert(conn, {
        base_url: req.baseUrl,
        url: req.originalUrl,
        method: req.method,
        data: JSON.stringify({body: req.body, params: req.params, query: req.query}),
        comments: '',
        created_by: admin_no,
      });

      output.errCode = ErrorCode.success;
      output.data = userData;

    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    }
  },

  getItemHistory: async (req, res) => {
    //response data
    let output = {
      errCode: ErrorCode.unknown,
      list: [],
    };

    try {
      const {
        admin_no
      } = req.admin;

      const {
        user_no
      } = req.params;

      if (!user_no) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error();
      }

      let {
        page,
        limit,
        method,
      } = req.query;

      limit = limit || 10;

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      const queryObjects = {url: `${req.baseUrl}/${user_no}`, method };
      const queryOptions = {page, limit, orderBy: ' created_at desc' };

      result = await daoSvc.admin_operation_log_view.select(conn, queryObjects, queryOptions);

      if (!result) {
        output.errCode = ErrorCode.User.notFoundUser;
        throw new Error();
      } else {
        let resultTotalCnt = await daoSvc.admin_operation_log_view.total_cnt(conn, queryObjects, queryOptions);

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

  modItem: async (req, res) => {
    //response data
    let output = {
      errCode: ErrorCode.unknown
    };

    try {
      const {
        admin_no
      } = req.admin;

      const {
        user_no
      } = req.params;

      if (!user_no) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error();
      }

      let {
        id,
        status,
        agree_marketing,
        agree_sms_email,
        agree_push_like_item,
        agree_push_recommend_item,
        agree_push_event,
        comments,
      } = req.body;

      const agreements = {
        agree_marketing,
        agree_sms_email,
        agree_push_like_item,
        agree_push_recommend_item,
        agree_push_event,
      };

      if (!comments) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error();
      }

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      await conn.startTransaction();

      if (id || status) {

        if (![Constants.User.Status.normal, Constants.User.Status.paused].includes(status)) {
          output.errCode = ErrorCode.Common.invalidParameter;
          throw new Error();
        }

        let queryOptions = {};

        queryOptions.whereCustomQuery = ' and status <> 0 ';
        queryOptions.whereCustomParams = [];

        result = await daoSvc.user_tbl.update(conn, {no: user_no, id, status}, queryOptions);

        if (!result || result.errCode !== ErrorCode.success) {
          output.errCode = ErrorCode.Common.invalidParameter;
          throw new Error();
        }
      }

      for (let type of Object.keys(agreements)) {
        if (typeof agreements[type] !== 'undefined') {
          result = await daoSvc.user_agreement_tbl.insert(conn, {user_no, type, agreement: agreements[type]});

          if (!result || result.errCode !== ErrorCode.success) {
            output.errCode = ErrorCode.Common.invalidParameter;
            throw new Error();
          }
        }
      }

      await daoSvc.admin_operation_log.insert(conn, {
        base_url: req.baseUrl,
        url: req.originalUrl,
        method: req.method,
        data: JSON.stringify({body: req.body, params: req.params, query: req.query}),
        comments,
        created_by: admin_no,
      });

      output.errCode = ErrorCode.success;

      await conn.commit();

    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    }
  },

  resetPasswd: async (req, res) => {

    //response data
    let output = {
      errCode: ErrorCode.unknown
    };

    try {
      const {
        admin_no
      } = req.admin;

      const {
        user_no
      } = req.params;

      if (!user_no) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error();
      }

      let {
        id,
        comments,
      } = req.body;

      if (!comments) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error();
      }

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      let user = await daoSvc.user_tbl.select(conn, { no: user_no, id }, {firstObjOnly: 1});

      if (!user) {
        output.errCode = ErrorCode.User.notFoundUser;
        throw new Error();
      }

      const passwdNew = funcAuth.makeRandomPasswd(9);

      let passwd_enc = await funcAuth.passwdHash(passwdNew);

      if (!passwd_enc) {
        output.errCode = ErrorCode.Auth.hashingFailure;
        throw new Error('hashingFailure');
      }

      let result = await daoSvc.user_shadow_tbl.update(conn, { user_no, passwd: passwd_enc });
      if (result && !result.errCode) {
        // send mail
        result = await mailer.send({to: user.id, subject: "서비스 임시비밀번호", text: passwdNew});
        if (result && !result.errCode) {
          output.errCode = ErrorCode.success;
        } else {
          output.message = result.message;
        }
      }

      await daoSvc.admin_operation_log.insert(conn, {
        base_url: req.baseUrl,
        url: req.originalUrl,
        method: req.method,
        data: JSON.stringify({body: req.body, params: req.params, query: req.query}),
        comments,
        created_by: admin_no,
      });

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
        admin_no
      } = req.admin;

      const {
        user_no
      } = req.params;

      if (!user_no) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error();
      }

      let {
        id,
        comments,
      } = req.body;

      if (!comments) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error();
      }

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      let user = await daoSvc.user_tbl.select(conn, { no: user_no, id }, {firstObjOnly: 1});

      if (!user) {
        output.errCode = ErrorCode.User.notFoundUser;
        throw new Error();
      }

      await conn.startTransaction();

      result = await daoSvc.user_tbl.delete(conn, {no: user_no}, {updateCustom: { status: 1 }});

      if (!result || result.errCode !== ErrorCode.success) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error();
      }

      await daoSvc.admin_operation_log.insert(conn, {
        base_url: req.baseUrl,
        url: req.originalUrl,
        method: req.method,
        data: JSON.stringify({body: req.body, params: req.params, query: req.query}),
        comments,
        created_by: admin_no,
      });

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
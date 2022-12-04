const _ = require('lodash');

const { ErrorCode } = require('../../../usersvc-common/constant/consts');

const daoSvc = require('../../../usersvc-common/dao/usersvc');

// const postbox = require('../../../usersvc-common/postbox/api');

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
        category,
        inquiry_dt,
        resolved_dt,
        resolved,
        q_type,
        q,
        page,
      } = req.query;

      let {
        limit,
      } = req.query;

      limit = limit || 10;

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      const dao = daoSvc.inquiry_chat_view;

      if (!dao) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      let queryOptions = {page, limit, orderBy: ' created_at desc'};

      let commonQuery = ' seq=0 ';   // seq=0 문의시작.
      let whereCustomParams = [];

      let categoryQuery = '';
      let inquiryTimeQuery = '';
      let resolvedTimeQuery = '';
      let resolvedQuery = '';
      let qQuery = '';

      queryOptions.fieldsCustom = [
        'created_at', 'resolved_at', 'resolved_by',
        '(SELECT admin_name FROM admin_info_tbl where admin_no = inquiry_chat_view.resolved_by) as resolved_admin'
      ];

      if (category) {
        let categories = category.split(',');

        categoryQuery = ` and category in ( ${categories.map(()=>'?').join(',')} ) `;
        whereCustomParams.push(...categories);
      }

      if (resolved == 0 || resolved == 1) {   //문자로 올지 숫자로 올지 모름.. 둘다 오케..
        resolvedQuery = ' and resolved = ?';
        whereCustomParams.push(resolved);
      }

      if (inquiry_dt) {
        if (inquiry_dt.start) {
          inquiryTimeQuery += ' and created_at >= ? ';
          whereCustomParams.push(inquiry_dt.start);
        }
        if (inquiry_dt.end) {
          inquiryTimeQuery += ' and created_at <= ? ';
          whereCustomParams.push(inquiry_dt.end);
        }
      }

      if (resolved_dt) {
        if (resolved_dt.start) {
          resolvedTimeQuery += ' and resolved_at >= ? ';
          whereCustomParams.push(resolved_dt.start);
        }
        if (resolved_dt.end) {
          resolvedTimeQuery += ' and resolved_at <= ? ';
          whereCustomParams.push(resolved_dt.end);
        }
      }

      //TODO: 일반검색 해야함.. 조금만 기다려달라! 지금은 곤란하다!
      //

      queryOptions.whereCustomQueryOnly = 1
      queryOptions.whereCustomQuery = ` 
        ${commonQuery} 
        ${categoryQuery} 
        ${resolvedQuery} 
        ${inquiryTimeQuery} 
        ${resolvedTimeQuery} 
        ${qQuery} `;
      queryOptions.whereCustomParams = whereCustomParams;

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

  getItem: async (req, res) => {

    //response data
    let output = {
      errCode: ErrorCode.unknown,
      list: [],
      user: {},
    };

    try {
      const {
        conversation_id,
      } = req.params;

      if (!conversation_id) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      const dao = daoSvc.inquiry_chat_tbl;

      if (!dao) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      const daoUser = daoSvc.user_info_view;

      if (!daoUser) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      //문의내용 쿼리
      let queryOptions = { fieldsEx:1, includeDeleted: 1 };

      queryOptions.fieldsCustom = [
        'deleted_by',
        '(SELECT admin_name FROM admin_info_tbl where admin_no = inquiry_chat_tbl.created_by) as created_admin',
      ];
      queryOptions.orderBy = ' seq, deleted_at is not null, created_at desc';

      result = await dao.select(conn, {conversation_id}, queryOptions);

      output.errCode = ErrorCode.success;
      output.data = result;

      if (result && result.length) {
        //회원정보 쿼리
        result = await daoUser.select(conn, {user_no: result[0].user_no}, {firstObjOnly:1});

        output.user = result;
      }

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
      no: null,
    };

    try {
      const {
        admin_no
      } = req.admin;

      const {
        conversation_id,
      } = req.params;

      if (!conversation_id) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      const {
        user_no,
        category,
        contents,
        imgurl,
      } = req.body;

      if (!user_no || !category || !contents) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      const dao = daoSvc.inquiry_chat_tbl;

      if (!dao) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      await conn.startTransaction();

      result = await dao.insert(conn, {
        user_no,
        category,
        conversation_id,
        direction: 1,
        seq: 1,
        contents,
        imgurl,
        operator_no: admin_no,
      });

      if (!result || result.errCode || !result.insertId) {
        result && (output = {...output, ...result});
        throw new Error();
      }

      output.errCode = ErrorCode.success;
      output.no = result.insertId;

      // resolved
      result = await dao.update(conn, {
        resolved: 1,
        resolved_at: '!now()',
        resolved_by: admin_no,
        operator_no: admin_no,
      }, {
        whereCustomQuery: ' conversation_id = ? and direction = 0 and resolved = 0 ',
        whereCustomParams: [conversation_id],
        whereCustomQueryOnly: 1,
        allowMultipleAffect: 1,
      })
      //

      if (!result || result.errCode) {
        result && (output = {...output, ...result});
        throw new Error();
      }

      await conn.commit();

      // // 1:1 문의 답변 등록된 경우 1회 메시지 전송
      // await postbox.postMessageAutogen(conn, {user_no, situation_code: 'SSVC0011v1'});

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
        conversation_id,
        no,
      } = req.params;

      if (!conversation_id || !no) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      const {
        user_no,
        category,
        contents,
        imgurl,
      } = req.body;

      if (!user_no || !category || !contents) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      const dao = daoSvc.inquiry_chat_tbl;

      if (!dao) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      await conn.startTransaction();

      //TODO: 삭제 후 입력으로 변경해야 함.

      // result = await dao.update(conn, {
      //   no,
      //   contents,
      //   operator_no: admin_no,
      // }, {
      //   whereCustomQuery: ' and conversation_id = ? ',
      //   whereCustomParams: [conversation_id],
      // });
      //
      // if (!result || result.errCode) {
      //   result && (output = {...output, ...result});
      //   throw new Error();
      // }
      //
      // output.errCode = ErrorCode.success;

      //삭제 후 입력 : 삭제
      result = await dao.delete(conn, {
        no,
        operator_no: admin_no,
      }, {
        whereCustomQuery: ' and conversation_id = ? ',
        whereCustomParams: [conversation_id],
      });

      if (!result || result.errCode) {
        result && (output = {...output, ...result});
        throw new Error();
      }

      //삭제 후 입력 : 입력
      result = await dao.insert(conn, {
        user_no,
        category,
        conversation_id,
        direction: 1,
        seq: 1,
        contents,
        imgurl,
        operator_no: admin_no,
      });

      if (!result || result.errCode || !result.insertId) {
        result && (output = {...output, ...result});
        throw new Error();
      }

      output.errCode = ErrorCode.success;
      output.no = result.insertId;

      // resolved
      result = await dao.update(conn, {
        resolved_at: '!now()',
        resolved_by: admin_no,
        operator_no: admin_no,
      }, {
        whereCustomQuery: ' conversation_id = ? and direction = 0 and resolved = 1 ',
        whereCustomParams: [conversation_id],
        whereCustomQueryOnly: 1,
        allowMultipleAffect: 1,
      })
      //

      if (!result || result.errCode) {
        result && (output = {...output, ...result});
        throw new Error();
      }

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
        admin_no
      } = req.admin;

      const {
        conversation_id,
        no,
      } = req.params;

      if (!conversation_id || !no) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      //result of function call
      let result;

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      const dao = daoSvc.inquiry_chat_tbl;

      if (!dao) {
        output.errCode = ErrorCode.Common.invalidParameter;
        res.payload = {...output};
        return;
      }

      await conn.startTransaction();

      result = await dao.delete(conn, {
        no,
        operator_no: admin_no,
      }, {
        whereCustomQuery: ' and conversation_id = ? and direction = 1',
        whereCustomParams: [conversation_id],
      });

      if (!result || result.errCode) {
        result && (output = {...output, ...result});
        throw new Error();
      }

      output.errCode = ErrorCode.success;

      // resolved
      result = await dao.update(conn, {
        resolved: 0,
        resolved_at: '!null',
        resolved_by: '!null',
        operator_no: admin_no,
      }, {
        whereCustomQuery: ' conversation_id = ? and direction = 0 and resolved = 1 ',
        whereCustomParams: [conversation_id],
        whereCustomQueryOnly: 1,
        allowMultipleAffect: 1,
      })
      //

      if (!result || result.errCode) {
        result && (output = {...output, ...result});
        throw new Error();
      }

      await conn.commit();

    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    }
  },

};
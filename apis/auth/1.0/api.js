const _ = require('lodash');
const crypto = require('crypto');

const moment = require('moment');

const { ErrorCode } = require('../../../usersvc-common/constant/consts');

const daoAuth = require('./dao');
const funcAuth = require('./func');

const mailer = require('../../../utils/mailer');
const daoAdmin = require("../../admin/1.0/dao");

module.exports = {
  login: async (req, res) => {
    let {
      id,
      passwd,
    } = req.body;

    //response data
    let output = {
      errCode: ErrorCode.unknown,
      accessToken: null,
      // refreshToken: null,
    };

    if (!id || !passwd) {
      throw new global.errors.BadRequestError(__('이메일이나 비밀번호가 잘못되었습니다. 다시 확인해 주세요.'));
    }

    //데이터베이스 커넥션
    const conn = await req.getDBConn();

    //사용자 비밀번호 확인
    let admin = await daoAuth.getAdminPasswdById(conn, { id });

    if (!admin || !admin.length) {
      throw new global.errors.UnauthorizedError(__('이메일이나 비밀번호가 잘못되었습니다. 다시 확인해 주세요.'));
    }
    admin = admin[0];

    //비밀번호 검증
    if (!admin.passwd || !(await funcAuth.compare(passwd, admin.passwd))) {
      throw new global.errors.UnauthorizedError(__('이메일이나 비밀번호가 잘못되었습니다. 다시 확인해 주세요.'));
    }

    //세션키 생성 - 세션서버 저장용
    // admin.hash = crypto.createHash('md5')
    //   .update(admin.id + passwd + 'AUTH##ehRo3lskfk')
    //   .update(crypto.randomBytes(8).toString('base64').substr(0, 8))
    //   .digest('hex');
    admin.hash = await funcAuth.tokenHash(`${admin.id}${passwd}`);

    //api 호출용 토큰 생성
    const accessToken = await funcAuth.makeAccessToken(admin);

    if (!accessToken) {
      throw new global.errors.InternalServerError(__('문제가 있습니다. 고객센터로 연락 주세요.'));
    }

    // const refreshToken = await funcAuth.makeRefreshToken(admin);
    //
    // if (!refreshToken) {
    //   throw new global.errors.InternalServerError(__('문제가 있습니다. 고객센터로 연락 주세요.'));
    // }

    //TODO: 세션 서버에 로그인 세션 저장
    //admin_no:hash:admin
    //

    //TODO: 로그인 로깅
    //

    output.errCode = ErrorCode.success;
    output.accessToken = accessToken;
    // output.refreshToken = refreshToken;

    res.payload = {
      ...output
    };
  },

  logout: async (req, res) => {
    const admin = req.admin;

    //TODO: 세션 서버에서 로그인 세션 삭제
    //admin_no:hash:admin
    //

    res.payload = {
      errCode: ErrorCode.success,
    };
  },

  refresh: async (req, res) => {
    let output = {
      errCode: ErrorCode.unknown,
      accessToken: null,
      refreshToken: null,
    }

    // 어드민은 토큰 갱신 지원하지 않기..
    //
    // let is_refresh_refresh = 0;
    //
    // if (!req.admin.hash || !req.admin.admin.hash) {
    //   // 둘다 갱신
    //   is_refresh_refresh = 1;
    // } else {
    //   if (req.admin.hash !== req.admin.admin.hash) {
    //     // 잘못된 요청
    //     output.errCode = ErrorCode.Common.invalidParameter;
    //     res.payload = {
    //       ...output
    //     }
    //     return;
    //   }
    // }
    //
    // // TODO: 세션 서버에서 hash로 admin_no 찾고 비교
    // // let admin_no = ///
    // // if ( req.admin.admin.admin_no !== admin_no) {
    // //   // 잘못된 요청
    // // }
    //
    // if (req.admin.rftm < (new Date()).getTime()) {
    //   // 리프레시 토큰 갱신. 하루에 한번만.
    //   is_refresh_refresh = 1;
    // }
    //
    // let admin = {
    //   admin_no: req.admin.admin.admin_no,
    //   hash: req.admin.hash,
    // };
    //
    // let refreshToken, accessToken;
    //
    // if (is_refresh_refresh) {
    //   admin.hash = await funcAuth.tokenHash(`${admin.admin_no}passwd`);
    //
    //   refreshToken = await funcAuth.makeRefreshToken(admin);
    //
    //   if (!refreshToken) {
    //     throw new global.errors.InternalServerError(__('문제가 있습니다. 고객센터로 연락 주세요.'));
    //   }
    //
    //   // TODO: 세션 서버에 로그인 세션 저장
    //   // admin_no:hash:admin
    //   //
    //   //
    //   // TODO: 로그인 로깅
    // } else {
    //   refreshToken = req.get('refreshToken');
    // }
    //
    // //api 호출용 토큰 생성
    // accessToken = await funcAuth.makeAccessToken(admin);
    // if (!accessToken) {
    //   throw new global.errors.InternalServerError(__('문제가 있습니다. 고객센터로 연락 주세요.'));
    // }
    //
    // output.errCode = ErrorCode.success;
    // output.accessToken = accessToken;
    // output.refreshToken = refreshToken;

    res.payload = {
      ...output
    };
  },

  putPasswd: async (req, res, next) => {
    //response data
    let output = {
      errCode: ErrorCode.unknown,
    };

    try {
      const {
        admin_no,
      } = req.admin;

      let {
        passwdOld,
        passwdNew
      } = req.body;

      if (!passwdOld || !passwdNew) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error();
      }

      //데이터베이스 커넥션
      const conn = await req.getDBConn();

      //기존 사용자 비밀번호 확인
      let admin = await daoAuth.getAdminPasswdByAdminNo(conn, { admin_no });

      if (!admin || !admin.length) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error();
      }
      admin = admin[0];

      //비밀번호 검증
      if (!admin.passwd || !(await funcAuth.compare(passwdOld, admin.passwd))) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error();
      }

      //check leaked passwd
      let result = funcAuth.checkStrongPasswd(passwdNew);
      if (!result) {
        output.errCode = ErrorCode.Auth.leakedPasswd;
        throw new Error();
      }

      result = await daoAuth.putAdminPasswd(conn, { admin_no, passwd: passwdNew });

      if (result && !result.errCode) {
        //기존 세션 로그아웃
        let payload = {};
        await module.exports.logout(req, { payload });

        output.errCode = ErrorCode.success;
      } else {

      }
    } catch (e) {
      console.log(e);
    }

    res.payload = {
      ...output
    };
  },
};
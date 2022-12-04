const funcAuth = require('./func');

const { ErrorCode } = require('../../../usersvc-common/constant/consts');

module.exports = {
  getAdminPasswdById: async (conn, { id }) => {
    if (!id) {
      return [];
    }

    let sql = `
      SELECT  u.no as admin_no,
              u.id,
              IFNULL(us.passwd, '') as passwd
      FROM    admin_tbl as u
              LEFT JOIN admin_shadow_tbl as us on u.no = us.admin_no
      WHERE   u.id = ? and u.leaved_at is null
    `;

    let params = [
      id
    ];

    return await conn.q(sql, params);
  },

  getAdminPasswdByAdminNo: async (conn, { admin_no }) => {
    if (!admin_no) {
      return [];
    }

    let sql = `
      SELECT  u.no as admin_no,
              u.id,
              IFNULL(up.passwd, '') as passwd
      FROM    admin_tbl as u
              LEFT JOIN admin_shadow_tbl as up on u.no = up.admin_no
      WHERE   u.no = ? and u.leaved_at is null
    `;

    let params = [
      admin_no
    ];

    return await conn.q(sql, params);
  },

  setAdminPasswd: async (conn, { admin_no, passwd /*plain text*/ }) => {
    let output = {
      errCode: ErrorCode.unknown,
    };

    try {
      if (!conn || !admin_no || !passwd) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error('invalidParameter');
      }

      let passwd_enc = await funcAuth.passwdHash(passwd);

      if (!passwd_enc) {
        output.errCode = ErrorCode.Auth.hashingFailure;
        throw new Error('hashingFailure');
      }

      let sql = `
        INSERT INTO admin_shadow_tbl (passwd, admin_no)
        VALUES (?, ?)
      `;

      let params = [
        passwd_enc,
        admin_no
      ];

      let result = await conn.q(sql, params);

      if (result && result.affectedRows === 1) {
        output.errCode = ErrorCode.success;
      }

    } catch (e) {
      console.log(e);
    }

    return output;
  },

  putAdminPasswd: async (conn, { admin_no, passwd /*plain text*/ }) => {
    let output = {
      errCode: ErrorCode.unknown,
    };

    try {
      if (!conn || !admin_no || !passwd ) {
        output.errCode = ErrorCode.Common.invalidParameter;
        throw new Error('invalidParameter');
      }

      let passwd_enc = await funcAuth.passwdHash(passwd);

      if (!passwd_enc) {
        output.errCode = ErrorCode.Auth.hashingFailure;
        throw new Error('hashingFailure');
      }

      let sql = `
        UPDATE  admin_shadow_tbl
        SET     updated_at = now(),
                passwd = ? 
        WHERE   admin_no = ?
      `;

      let params = [
        passwd_enc,
        admin_no
      ];

      let result = await conn.q(sql, params);

      if (result && result.affectedRows === 1) {
        output.errCode = ErrorCode.success;
      }

    } catch (e) {
      console.log(e);
    }

    return output;
  },
};
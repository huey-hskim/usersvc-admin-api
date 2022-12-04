
const { ErrorCode } = require('../../../usersvc-common/constant/consts');

const daoSvc = require('../../../usersvc-common/dao/usersvc');

module.exports = {
  selectAdminList: async (conn, { q, page, limit }) => {
    page = page || 0;
    limit = limit || 10;

    let params;

    let whereQuery = '';

    if (q) {
      whereQuery = `and (name = ? or id = ?)`;
      params.push(q);
      params.push(q);
    }

    let sql = `
      SELECT    a.no as admin_no,
                a.id as admin_id,
                ai.admin_name,
                ai.admin_phone,
                ai.admin_rank,
                ai.user_no,
                a.created_at,
                ai.updated_at
      FROM      admin_tbl as a
                LEFT JOIN admin_info_tbl as ai on ai.admin_no = a.no
      WHERE     leaved_at is null
                ${whereQuery}
      LIMIT ${page * limit}, ${(page+1) * limit}
    `;

    return await conn.q(sql, params);
  },
};
const {ErrorCode} = require("../constant/consts");

function QueryHelper({table_name, keys, is_autoincrement_key, fields, fields_ex, fields_ondupl_update, fields_soft_deleted, fields_json_convert}) {
  this.table_name = table_name;
  this.keys = keys;
  this.is_autoincrement_key = is_autoincrement_key;
  this.fields = fields;
  this.fields_ex = fields_ex;
  this.fields_ondupl_update = fields_ondupl_update || [];
  this.fields_soft_deleted = fields_soft_deleted || [];
  this.fields_json_convert = fields_json_convert || [];

  this.that = this;

  return this;
}

QueryHelper.prototype.total_cnt = async function (conn, objValues, {
  page,
  whereCustomQuery, whereCustomQueryOnly, whereCustomParams,
  includeDeleted} = {}) {

  let output = {
    errCode: ErrorCode.unknown,
    totalCnt: 0,
  }

  if (Number(page) > 1) {
    return output;
  }

  let params = [];

  let table_name = this.table_name;
  let fieldQuery = ' count(*) as total_cnt';
  let whereQuery = '';

  if (whereCustomQueryOnly) {
    whereQuery = whereCustomQuery;
    (whereCustomParams && whereCustomParams.length) && params.push(...whereCustomParams);
  } else {
    for (let i of Object.keys(objValues)) {
      if (objValues[i] !== undefined) {
        whereQuery += `and ${i} = ? `;
        params.push(objValues[i]);
      }
    }

    (whereCustomQuery) && ((whereQuery += whereCustomQuery) && (whereCustomParams && whereCustomParams.length) && params.push(...whereCustomParams));
  }

  if (!includeDeleted && this.fields_soft_deleted.length) {
    whereQuery += `and ${this.fields_soft_deleted[0]} is null `;
  }

  whereQuery = whereQuery.replace(/\s*/,'').replace(/^and/,'');

  let sql = `
      SELECT  ${fieldQuery}
      FROM    ${table_name}
      WHERE   ${whereQuery}
    `;

  let result = await conn.q(sql, params);
  if(!result || !result.length) {
    return 0;
  }

  output.errCode = ErrorCode.success;
  output.totalCnt = result[0].total_cnt;

  return output;
}

QueryHelper.prototype.select = async function (conn, objValues, {
  page, limit, orderBy,
  firstObjOnly,
  fieldsEx,
  fieldsCustom, fieldsCustomOnly,
  whereCustomQuery, whereCustomQueryOnly, whereCustomParams,
  includeDeleted} = {}) {

  let output = {
    errCode: ErrorCode.unknown,
  }

  page = Math.max(page || 1, 1);

  let params = [];

  let table_name = this.table_name;
  let fieldQuery = '';
  let whereQuery = '';
  let orderQuery = (orderBy)?`ORDER BY ${orderBy}`:'';
  let limitQuery = (limit)?`LIMIT ${(page-1) * limit}, ${limit}`:'';

  let fieldsSet = [];

  if (fieldsCustomOnly) {
    if (!fieldsCustom) {
      output.errCode = ErrorCode.Common.invalidParameter;
      output.message = ErrorCode.Common._message.invalidParameter;
      return [];
    }
    fieldsSet.push(fieldsCustom);
  } else {
    fieldsSet.push(this.keys);
    fieldsSet.push(this.fields);

    fieldsCustom && fieldsCustom.length && fieldsSet.push(fieldsCustom);

    fieldsEx && this.fields_ex.length && fieldsSet.push(this.fields_ex);
  }

  for (let l of fieldsSet) {
    for (let i of l) {
      fieldQuery += `, ${i}`;
    }
  }

  if (whereCustomQueryOnly) {
    whereQuery = whereCustomQuery;
    (whereCustomParams && whereCustomParams.length) && params.push(...whereCustomParams);
  } else {
    for (let i of Object.keys(objValues)) {
      if (objValues[i] !== undefined) {
        // if (typeof objValues[i] === 'string' && objValues[i].charAt(0) === '!') {
        //   whereQuery += `and ${i} = ${objValues[i].substring(1)} `;
        // } else {
          whereQuery += `and ${i} = ? `;
          params.push(objValues[i])
        // }
      }
    }

    (whereCustomQuery) && ((whereQuery += whereCustomQuery) && (whereCustomParams && whereCustomParams.length) && params.push(...whereCustomParams));
  }

  if (!includeDeleted && this.fields_soft_deleted.length) {
    whereQuery += `and ${this.fields_soft_deleted[0]} is null `;
  }

  fieldQuery = fieldQuery.replace(/^,/,'');
  whereQuery = whereQuery.replace(/\s*/,'').replace(/^and/,'');

  let sql = `
      SELECT  ${fieldQuery}
      FROM    ${table_name}
      WHERE   ${whereQuery}
      ${orderQuery}
      ${limitQuery}
    `;

  let result = await conn.q(sql, params);
  if(!result || !result.length) {
    return (firstObjOnly)?null:[];
  }

  output = (firstObjOnly)?result[0]:result;

  for (let j of this.fields_json_convert) {
    if (fieldQuery.includes(j)) {
      if (output.length) {
        output.map((i) => {
          try {
            i[j] = JSON.parse(i[j]).join(',');
          } catch (e) {
          }
          return i;
        });
      } else {
        try {
          output[j] = JSON.parse(output[j]).join(',');
        } catch (e) {
        }
      }
    }
  }

  return output;
};

QueryHelper.prototype.insert = async function (conn, objValues, {}={}) {
  let output = {
    errCode: ErrorCode.unknown,
    insertId: null
  };

  let params = [];

  let table_name = this.table_name;
  let fieldQuery = '';
  let valueQuery = '';
  let onDuplUpdateQuery = '';

  for (let i of this.fields_json_convert) {
    if (objValues[i] !== undefined && typeof objValues[i] === 'string') {
      objValues[i] = JSON.stringify(objValues[i].split(','));
    }
  }

  for (let l of [this.keys, this.fields, this.fields_ex]) {
    for (let i of l) {
      if (objValues[i] !== undefined) {
        fieldQuery += `, ${i}`;
        if (typeof objValues[i] === 'string' && objValues[i].charAt(0) === '!') {
          valueQuery += `, ${objValues[i].substring(1)}`;
        } else {
          valueQuery += ', ?';
          params.push(objValues[i])
        }
      }
    }
  }

  if (objValues.operator_no) {
    fieldQuery += `, created_by`;
    valueQuery += ', ?';
    params.push(objValues.operator_no);

    if (this.fields_ex.includes('updated_by')) {
      fieldQuery += `, updated_by`;
      valueQuery += ', ?';
      params.push(objValues.operator_no);
    }
  }

  fieldQuery = fieldQuery.replace(/^,/,'');
  valueQuery = valueQuery.replace(/^,/,'');

  if (!fieldQuery) {
    output.errCode = ErrorCode.Common.invalidParameter;
    output.message = ErrorCode.Common._message.invalidParameter;
    return output;
  }

  for (let i of this.fields_ondupl_update) {
    if (objValues[i] !== undefined) {
      if (typeof objValues[i] === 'string' && objValues[i].charAt(0) === '!') {
        onDuplUpdateQuery += `, ${i} = ${objValues[i].substring(1)}`;
      } else {
        onDuplUpdateQuery += `, ${i} = ?`;
        params.push(objValues[i])
      }
    } else if (i === 'updated_at') {
      onDuplUpdateQuery += `, updated_at = now()`;
    } else if (i.charAt(0) === '+') {
      onDuplUpdateQuery += `, ${i.substring(1)} = ${i.substring(1)} +1 `;
    }
  }

  onDuplUpdateQuery = onDuplUpdateQuery.replace(/^,/,'');

  try {
    let sql = `
      INSERT INTO ${table_name} (
          ${fieldQuery}       
      ) VALUES (
          ${valueQuery} 
      )
      ${onDuplUpdateQuery?'ON DUPLICATE KEY UPDATE':''}
        ${onDuplUpdateQuery}
    `;

    let result = await conn.q(sql, params);
    if(!result // 결과 없으면 오류
      // 유효타가 1이면 정상, 2는 업데이트가 있을때만
      || (result.affectedRows !== 1 && (onDuplUpdateQuery && result.affectedRows !== 2))
      // 자동증가 키라면 insertId가 있어야 함.
      || (this.is_autoincrement_key && !result.insertId))
    {
      return output;
    }

    output.errCode = ErrorCode.success;
    output.insertId = result.insertId

  } catch (e) {
    if(e && e.sqlState === '23000') {
      output.errCode = ErrorCode.Database.idDuplicated;
      output.message = ErrorCode.Database._message.idDuplicated;
    } else {
      output.errCode = ErrorCode.Database.unknown;
    }
  }

  return output;
};


QueryHelper.prototype.update = async function (conn, objValues, {
  whereCustomQuery, whereCustomQueryOnly, whereCustomParams, allowMultipleAffect} = {} ) {

  let output = {
    errCode: ErrorCode.unknown
  };

  let params = [];

  let table_name = this.table_name;
  let fieldQuery = '';
  let whereQuery = '';

  for (let i of this.fields_json_convert) {
    if (objValues[i] !== undefined && typeof objValues[i] === 'string') {
      objValues[i] = JSON.stringify(objValues[i].split(','));
    }
  }

  for (let l of [this.fields, this.fields_ex]) {
    for (let i of l) {
      if (objValues[i] !== undefined) {
        if (typeof objValues[i] === 'string' && objValues[i].charAt(0) === '!') {
          fieldQuery += `, ${i} = ${objValues[i].substring(1)}`;
        } else {
          fieldQuery += `, ${i} = ?`;
          params.push(objValues[i])
        }
      }
    }
  }

  if(!fieldQuery) {
    output.errCode = ErrorCode.Common.invalidParameter;
    output.message = ErrorCode.Common._message.invalidParameter;
    return output;
  }

  if (objValues.operator_no) {
    fieldQuery += `, updated_by = ?`;
    params.push(objValues.operator_no);
  }

  if (whereCustomQueryOnly) {
    whereQuery = whereCustomQuery;
    (whereCustomParams && whereCustomParams.length) && params.push(...whereCustomParams);
  } else {
    for (let i of this.keys) {
      if (objValues[i] !== undefined) {
        whereQuery += ` and ${i} = ? `;
        params.push(objValues[i])
      }
    }

    (whereCustomQuery) && ((whereQuery += whereCustomQuery) && (whereCustomParams && whereCustomParams.length) && params.push(...whereCustomParams));
  }

  if (this.fields_soft_deleted.length) {
    whereQuery += ` and ${this.fields_soft_deleted[0]} is null `;
  }

  if(!whereQuery) {
    output.errCode = ErrorCode.Common.invalidParameter;
    output.message = ErrorCode.Common._message.invalidParameter;
    return output;
  }

  whereQuery = whereQuery.replace(/\s*/,'').replace(/^and/,'');

  try {
    let sql = `
      UPDATE  ${table_name}
      SET     updated_at = now()
              ${fieldQuery}
      WHERE   ${whereQuery}
    `;

    let result = await conn.q(sql, params);
    if (!result || (!allowMultipleAffect && result.affectedRows !== 1)) {
      return output;
    }

    output.errCode = ErrorCode.success;

  } catch (e) {
    console.log(e);
  }

  return output;
};

QueryHelper.prototype.delete = async function (conn, objValues, {
  updateCustom = {},
  whereCustomQuery, whereCustomQueryOnly, whereCustomParams} = {}) {

  let output = {
    errCode: ErrorCode.unknown
  };

  let params = [];

  let table_name = this.table_name;
  let whereQuery = '';

  if (whereCustomQueryOnly) {
    whereQuery = whereCustomQuery;
    (whereCustomParams && whereCustomParams.length) && params.push(...whereCustomParams);
  } else {
    for (let l of [this.keys, this.fields]) {
      for (let i of l) {
        if (objValues[i] !== undefined) {
          whereQuery += ` and ${i} = ? `;
          params.push(objValues[i])
        }
      }
    }

    (whereCustomQuery) && ((whereQuery += whereCustomQuery) && (whereCustomParams && whereCustomParams.length) && params.push(...whereCustomParams));
  }

  if(!whereQuery) {
    output.errCode = ErrorCode.Common.invalidParameter;
    output.message = ErrorCode.Common._message.invalidParameter;
    return output;
  }

  whereQuery = whereQuery.replace(/\s*/,'').replace(/^and/,'');

  let updateCustomQuery = '';
  for (let o of Object.keys(updateCustom)) {
    updateCustomQuery += `, ${o} = ${updateCustom[o]} `;
  }

  try {
    let sql = '';

    if (this.fields_soft_deleted.length) {
      if (this.fields_soft_deleted.length < 2) {
        output.errCode = ErrorCode.Common.invalidParameter;
        output.message = ErrorCode.Common._message.invalidParameter;
        return output;
      }

      let operatorQuery = '';
      if (objValues.operator_no && this.fields_soft_deleted.length === 3) {
        operatorQuery += `, ${this.fields_soft_deleted[2]} = ${objValues.operator_no}`;
      }

      sql = `
        UPDATE  ${table_name}
        SET     ${this.fields_soft_deleted[0]} = ${this.fields_soft_deleted[1]}
                ${updateCustomQuery}
                ${operatorQuery}
        WHERE   ${whereQuery}
      `;
    } else {
      sql = `
        DELETE
        FROM    ${table_name}
        WHERE   ${whereQuery}
      `;
    }

    let result = await conn.q(sql, params);
    if (!result || result.affectedRows !== 1) {
      return output;
    }

    output.errCode = ErrorCode.success;

  } catch (e) {
    console.log(e);
  }

  return output;
};

QueryHelper.prototype.deleteAndInsert = async function (conn,
  { forDelete = {objValues: {}, whereCustom: {whereCustomQuery, whereCustomQueryOnly, whereCustomParams}},
    forInsert = {objValues: {}, whereCustom: {whereCustomQuery, whereCustomQueryOnly, whereCustomParams}}}) {
  let output = {
    errCode: ErrorCode.unknown,
    insertId: null
  };

  try {
    output = await this.delete(conn, forDelete.objValues, forDelete.whereCustom);
    if (!output || output.errCode !== ErrorCode.success) {
      // 실패해도 넘어감
    }

    output = await this.insert(conn, forInsert.objValues, forInsert.whereCustom);
  } catch (e) {
    console.log(e);
  }

  return output;
};

module.exports = {
  QueryHelper: QueryHelper
};
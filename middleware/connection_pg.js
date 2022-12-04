// const pg = require('pg');
// const named = require('node-postgres-named');
// const createPostgresql = require('common/connections/postgresql');

module.exports = function wrapper(connection) {
  var query = (sql, options) => {
    return new Promise((resolve, reject) => {
      connection.query(sql, options, (err, result) => {
        if (err) {
          return reject(err);
        }

        if (result === undefined) {
          result = [];
        }

        if (result.command === 'INSERT' || result.command === 'UPDATE' || result.command === 'DELETE') {
          if (result.rowCount > 0 && result.rows.length > 0) {
            return resolve(result.rows[0]);
          } else {
            return resolve(false);
          }
        }

        if (result && result.rows) {
          resolve(result.rows);
        } else if (result) {
          resolve(result);
        } else {
          resolve([]);
        }

      });
    });
  };

  const startTransaction = () => {
    return new Promise((resolve, reject) => {
      connection.query('BEGIN', (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      })
    });
  };

  const commit = () => {
    return new Promise((resolve, reject) => {
      connection.query('COMMIT', (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      })
    });
  };

  const rollback = () => {
    return new Promise((resolve, reject) => {
      connection.query('ROLLBACK', (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      })
    });
  };

  connection.q = query;
  connection.startTransaction = startTransaction;
  connection.commit = commit;
  connection.rollback = rollback;

  return connection;
}
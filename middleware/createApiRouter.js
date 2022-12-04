const express = require('express');
const AuthenticateInterface = require('../apis/authenticateInterface');

const dbHandlingFunctions = {
  asyncWrapping: (func) => {
    return async (req, res, next) => {
      let error = null;
      try {
        dbHandlingFunctions.create(req);
        await func(req, res, next);
      } catch (e) {
        error = e;
        dbHandlingFunctions.catch(req);
      } finally {
        dbHandlingFunctions.finally(req);
      }
      if (error) {
        next(error);
      } else {
        next();
      }
    };
  },
  create: (req) => {
    const dbConnFunctions = {
      // main: global.db.getMaster,
      mysql: global.mysql.getMaster,
      // biztalk: global.mysql.getBiztalk,
      // mongodb: global.mongodb.getMaster,
      // message: global.mongodb.getMessage,
    };
    req.dbConn = {
      // main: null,
      mysql: null,
      // biztalk: null,
      // mongodb: null,
      // message: null,
    };

    /**
     * 이름을 통해 DB connection 을 받아오는 함수
     * @param name : "mysql", "mongodb", "message", "biztalk"
     * @returns {Promise<*>}
     */
    req.getDBConn = async (name = 'mysql') => {
      if (!req.dbConn) {
        throw new global.errors.InternalServerError('이미 종료된 req 에서의 db 접근이 발생하였습니다.');
      }

      const { dbConn } = req;

      let conn = dbConn[name];

      if (conn === undefined) {
        throw new global.errors.InternalServerError(`지원하지 않는 DB (${name}) 입니다. ${JSON.stringify(Object.keys(dbConn))}`);
      } else if (conn) {
        return conn;
      }

      conn = await dbConnFunctions[name]();
      /**
       * 비동기 호출시 req.dbConn 이 null 로 처리되어 connection pool 이 회수 안되는 현상 발생한다.
       * 호출시 await 가 누락된게 없는지 확인하기 바란다.
       */
      if (!req.dbConn) {
        if (conn) {
          await conn.release();
        }
        throw new global.errors.InternalServerError('비동기 호출이 발생하였습니다.');
      }
      dbConn[name] = conn;

      return conn;
    };

    /**
     * 비동기로 처리할 작업인 경우 이 함수를 통해 처리할수 있다.
     * @param func (req, data) 실행할 함수
     * @param data 전달할 인자
     * @returns {Promise<void>}
     */
    req.execFuncWithAsyncDBConn = async (func, data) => {
      if (!func) {
        return;
      }

      const _req = {...req};
      try {
        dbHandlingFunctions.create(_req);
        await func(_req, data);
      } catch (e) {
        dbHandlingFunctions.catch(_req);
        console.error(e);
        global.errors.captureException(e, _req)
      } finally {
        dbHandlingFunctions.finally(_req);
      }
    };
  },
  catch: (req) => {
    if (!req.dbConn) {
      return;
    }

    Object.entries(req.dbConn).forEach(async ([key, val]) => {
      if (val && val.rollback) {
        await val.rollback();
      }
    });
  },
  finally: (req) => {
    if (!req.dbConn) {
      return;
    }

    Object.entries(req.dbConn).forEach(async ([key, val]) => {
      if (val && val.rollback) {
        await val.rollback();
      }
      if (val && val.release) {
        await val.release();
      }
    });

    req.dbConn = null;
  }
};

function createApiRouter(options = {}) {
  const router = express.Router(options);
  const auth = options.authorization;

  router.prefix = options.prefix;

  const apiFunctions = {};

  ['get', 'post', 'put', 'delete', 'patch', 'all'].forEach((method) => {
    const _method = router[method];
    router[method] = (path, ...args) => {
      let version = '1.0';
      if (typeof args[0] === 'string') {
        version = args[0];
        args.splice(0, 1);
      }

      // let isAuthOptional = false;
      // for (let f in args) {
      //   if (auth.optional === args[f]) {
      //     isAuthOptional = true;
      //     break;
      //   }
      // }
      // if (!isAuthOptional) {
      //   args.unshift(auth.required);
      // }

      const last = args.length - 1;

      apiFunctions[`[${method}] /${version}${path}`] = args[last];

      // args[last] = async (req, res, next) => {
      //   try {
      //     if (res._processed) {
      //       return next();
      //     }
      //
      //     dbHandlingFunctions.create(req);
      //
      //     const func = apiFunctions[`[${method}] /${req.apiVersion}${path}`];
      //     if (func) {
      //       await func(req, res, next);
      //       res._processed = true;
      //     }
      //     next();
      //   } catch (e) {
      //     dbHandlingFunctions.catch(req);
      //     next(e);
      //   } finally {
      //     dbHandlingFunctions.finally(req);
      //   }
      // };
      args[last] = async (req, res, next) => {
        if (auth && auth instanceof AuthenticateInterface) {
          await auth.authenticate(req, res, next);
        }

        const func = apiFunctions[`[${method}] /${req.apiVersion}${path}`];
        if (func) {
          await func(req, res, next);
          res._processed = true;
        }
      };

      for (let i in args) {
        const func = args[i];
        if (typeof func === 'function') {
          args[i] = dbHandlingFunctions.asyncWrapping(func);
        }
      }

      return _method.call(router, path, ...args);
    };
  });
  return router;
}

module.exports = createApiRouter;
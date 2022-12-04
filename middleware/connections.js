const _ = require('lodash');
const bluebird = require('bluebird');
const mysql = require('mysql');
const mongodb = require('mongodb');
// const redis = require('redis');
// const elasticsearch = require('elasticsearch');
// const httpawses = require('http-aws-es');
// const AWS = require('aws-sdk');

const {wrapper: mysqlWrapper, queryFormat} = require('./connection_mysql');
const {wrapper: mongodbWrapper} = require('./connection_mongodb');

// const {wrapper} = require('./connection_pg');

function getPool(config) {
  const pool = {};

  _.each(config, (v, key) => {
    if (key === 'mysql') {
      const poolCluster = mysql.createPoolCluster({restoreNodeTimeout: 100});
      _.each(v, (c, name) => {
        // c.queryFormat = queryFormat;
        poolCluster.add(_.upperFirst(name), c);

        poolCluster[`get${_.upperFirst(name)}`] = () => {
          return new Promise((resolve, reject) => {

            poolCluster.getConnection(_.upperFirst(name), (err, conn) => {

              if (err) {
                return reject(err);
              }

              conn = bluebird.promisifyAll(conn);
              conn = mysqlWrapper(conn);
              conn.config.namedPlaceholders = true;

              resolve(conn);
            });
          });
        };
      });

      pool[key] = poolCluster;
    } else if (key === 'mongodb') {
      const poolCluster = mongodb.MongoClient;
      _.each(v, (c, name) => {
        poolCluster[`get${_.upperFirst(name)}`] = () => {
          return new Promise((resolve, reject) => {
            const mongodbURL = `mongodb://${c.host}:${c.port}/`;
            return poolCluster.connect(mongodbURL, {
              useUnifiedTopology: true,
              useNewUrlParser: true,
              retryWrites: false,
              directConnection: true,
              auth: (c.user)?{username: c.user, password: c.password}:undefined,
              ssl: c.ssl,
              sslCA: (c.sslCA) ? (__dirname + c.sslCA) : undefined,
              // sslCA: __dirname + "/rds-combined-ca-bundle.pem",
              tlsAllowInvalidHostnames: true,
            }, (err, client) => {
              if (err) {
                return reject(err);
              }

              let conn = {client};
              conn.db = client.db(c.database || 'data');

              conn = mongodbWrapper(conn);

              resolve(conn);
            });
          });
        };
      });

      pool[key] = poolCluster;
    }
    // } else if (key === 'postgresql') {
    //   const poolCluster = wrapper(new pg.Pool(v));
    //   named.patch(poolCluster);
    //
    //   poolCluster.getMaster = () => {
    //     return new Promise((resolve, reject) => {
    //       poolCluster.connect((err, client, done) => {
    //         if (err) {
    //           reject(err);
    //         } else {
    //           client.release = done;
    //           resolve(named.patch(wrapper(client)));
    //         }
    //       });
    //     });
    //   };
    //   poolCluster.getSlave = () => {
    //     return new Promise((resolve, reject) => {
    //       poolCluster.connect((err, client, done) => {
    //         if (err) {
    //           reject(err);
    //         } else {
    //           client.release = done;
    //           resolve(named.patch(wrapper(client)));
    //         }
    //       });
    //     });
    //   };
    //
    //   pool[key] = poolCluster;
    // } else if (key === 'postgresql_replica') {
    //   const poolCluster = wrapper(new pg.Pool(v));
    //   named.patch(poolCluster);
    //
    //   poolCluster.getMaster = () => {
    //     return new Promise((resolve, reject) => {
    //       poolCluster.connect((err, client, done) => {
    //         if (err) {
    //           reject(err);
    //         } else {
    //           client.release = () => {
    //             done();
    //           };
    //           resolve(named.patch(wrapper(client)));
    //         }
    //       });
    //     });
    //   };
    //
    //   pool[key] = poolCluster;
    // }
  });

  return pool;
}

function connectionsMiddleware(server) {
  const pool = getPool(server.config.database);
  // global.db = pool['postgresql'];
  // global.pgReplica = pool['postgresql_replica'];
  global.mysql = pool['mysql'];
  // global.mongodb = pool['mongodb'];
  // global.redisSubscriber = redis.createClient(server.config.redis.subscribe);
  // global.redisPublisher = redis.createClient(server.config.redis.publish);

  // global.pgConn = createPostgresql(server.config.database.postgresql);

  // global.redisPublish = (channel, eventType, data) => {
  //   const payload = {
  //     header: {
  //       processId: process.pid,
  //       event: eventType
  //     },
  //     body: data
  //   };
  //   global.redisPublisher.publish(channel + '/' + eventType, JSON.stringify(payload));
  // };
  //
  // bluebird.promisifyAll(redis.RedisClient.prototype);
  // global.redis = redis.createClient(server.config.redis.store);
  // if (server.config.elasticsearch && server.config.elasticsearch.accessKey && server.config.elasticsearch.secretKey) {
  //   console.log('ES Using IAM');
  //   AWS.config.update({
  //     region: 'ap-northeast-2',
  //     credentials: new AWS.Credentials(server.config.elasticsearch.accessKey, server.config.elasticsearch.secretKey)
  //   });
  //   global.esConn = new elasticsearch.Client({
  //     host: server.config.elasticsearch.host,
  //     connectionClass: httpawses,
  //     log: server.config.elasticsearch.log
  //   });
  //   console.log('@@>>', global.esConn)
  // } else {
  //   console.log('ES Not Using IAM');
  //   global.esConn = new elasticsearch.Client({
  //     host: server.config.elasticsearch.host,
  //     log: server.config.elasticsearch.log
  //   });
  // }
}

module.exports = connectionsMiddleware;
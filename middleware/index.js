const serverMiddleware = require('./server');
const connectionsMiddleware = require('./connections');
const request = require('./request');
const routes = require('./routes');
const responseMiddleware = require('./response');
const errorMiddleware = require('./error');

module.exports = async (server) => {
  await serverMiddleware(server);
  await connectionsMiddleware(server);
  await request(server);
  await routes(server);
  await responseMiddleware(server);
  await errorMiddleware(server);

  return server;
};
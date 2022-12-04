const auth = require('../apis/auth/index');
const admin = require('../apis/admin/index');
const board = require('../apis/board/index');
const inquiry = require('../apis/inquiry/index');
const banner = require('../apis/banner/index');
const user = require('../apis/user/index');
const worker = require('../apis/worker/index');
const home = require('../apis/home/index');

module.exports = (server) => {
  server.useRoute = (route) => {
    if (route.prefix) {
      server.use(route.prefix, route);
    } else {
      server.use(route);
    }
  };

  server.useRoute(auth);
  server.useRoute(admin);
  server.useRoute(board);
  server.useRoute(inquiry);
  server.useRoute(banner);
  server.useRoute(user);
  server.useRoute(worker);
  server.useRoute(home);
};
const createApiRouter = require('../../middleware/createApiRouter');
const auth = new (require('./authenticate'))();

const router = createApiRouter({prefix: '/api/worker', authorization: auth});

const workerApi = require('./1.0/api');

router.get    ('/stat'                                , workerApi.stat.get);
router.post   ('/fire/:module/:proc'                  , workerApi.fire.any);

module.exports = router;
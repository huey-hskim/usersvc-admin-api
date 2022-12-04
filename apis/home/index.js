const createApiRouter = require('../../middleware/createApiRouter');
const auth = new (require('./authenticate'))();

const router = createApiRouter({prefix: '/home', authorization: auth});

const HomeApis = require('./1.0/api');

router.get    ('/stats'       , HomeApis.getSummary);    // 통계 요약
router.get    ('/stats/users' , HomeApis.getUsersStats); // 회원 현황
router.get    ('/stats/sales' , HomeApis.getSalesStats); // 매출 현황

module.exports = router;
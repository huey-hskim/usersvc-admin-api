const createApiRouter = require('../../middleware/createApiRouter');
const auth = new (require('./authenticate'))();

const router = createApiRouter({prefix: '/banner', authorization: auth});

const BannerApis = require('./1.0/api');

router.get    ('/:btype'                  , BannerApis.getList);    // 배너 아아템 목록
router.post   ('/:btype'                  , BannerApis.addItem);    // 배너 아아템 등록
router.get    ('/:btype/:bno'             , BannerApis.getItem);    // 배너 아아템 조회
router.patch  ('/:btype/:bno'             , BannerApis.modItem);    // 배너 아아템 수정
router.delete ('/:btype/:bno'             , BannerApis.delItem);    // 배너 아아템 삭제

module.exports = router;
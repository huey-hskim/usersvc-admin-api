const createApiRouter = require('../../middleware/createApiRouter');
const auth = new (require('./authenticate'))();

const router = createApiRouter({prefix: '/board', authorization: auth});

const BoardApis = require('./1.0/api');

router.get    ('/:btype'                  , BoardApis.getBoardList);    // 보드 아아템 목록
router.post   ('/:btype'                  , BoardApis.addBoardItem);    // 보드 아아템 등록
router.get    ('/:btype/:bno'             , BoardApis.getBoardItem);    // 보드 아아템 조회
router.patch  ('/:btype/:bno'             , BoardApis.modBoardItem);    // 보드 아아템 수정
router.delete ('/:btype/:bno'             , BoardApis.delBoardItem);    // 보드 아아템 삭제

module.exports = router;
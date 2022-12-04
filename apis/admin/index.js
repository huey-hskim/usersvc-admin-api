const createApiRouter = require('../../middleware/createApiRouter');
const auth = new (require('./authenticate'))();

const router = createApiRouter({prefix: '/admin', authorization: auth});

const AdminApis = require('./1.0/api');

router.get    ('/'                        , AdminApis.getAdmin);        // 어드민 정보 조회
router.patch  ('/'                        , AdminApis.modifyAdmin);     // 어드민 정보 수정
router.delete ('/'                        , AdminApis.leaveAdmin);      // 어드민 탈퇴

router.post   ('/admins'                  , AdminApis.joinAdmin);       // 어드민 등록은 어드민이..
router.get    ('/admins'                  , AdminApis.getAdminList);    // 어드민 정보 조회
router.get    ('/admins/:admin_no'        , AdminApis.getAdmin);        // 어드민 정보 조회
router.patch  ('/admins/:admin_no'        , AdminApis.modifyAdmin);     // 어드민 정보 수정
router.delete ('/admins/:admin_no'        , AdminApis.leaveAdmin);      // 어드민 탈퇴

module.exports = router;
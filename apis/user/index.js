const createApiRouter = require('../../middleware/createApiRouter');
const auth = new (require('./authenticate'))();

const router = createApiRouter({prefix: '/users', authorization: auth});

const UserApis = require('./1.0/api');

router.get    ('/'                            , UserApis.getList);        // 회원 목록
router.get    ('/:user_no'                    , UserApis.getItem);        // 회원 정보 조회
router.get    ('/:user_no/history'            , UserApis.getItemHistory); // 회원 정보 수정 이력
router.patch  ('/:user_no'                    , UserApis.modItem);        // 회원 정보 수정
router.post   ('/:user_no/passwd/reset'       , UserApis.resetPasswd);    // 임시비밀번호 이메일 전송
// router.post   ('/'                            , UserApis.addItem);        // 회원 정보 입력
router.delete ('/:user_no'                    , UserApis.delItem);        // 회원 탈퇴


module.exports = router;
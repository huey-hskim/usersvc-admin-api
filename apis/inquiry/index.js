const createApiRouter = require('../../middleware/createApiRouter');
const auth = new (require('./authenticate'))();

const router = createApiRouter({prefix: '/inquiry', authorization: auth});

const InquiryApis = require('./1.0/api');

router.get    ('/chats'                      , InquiryApis.getList);    // 문의 아아템 목록
router.get    ('/chat/:conversation_id'      , InquiryApis.getItem);    // 문의 아아템 조회
router.post   ('/chat/:conversation_id'      , InquiryApis.addItem);    // 문의 아아템 등록
router.patch  ('/chat/:conversation_id/:no'  , InquiryApis.modItem);    // 문의 아아템 수정
router.delete ('/chat/:conversation_id/:no'  , InquiryApis.delItem);    // 문의 아아템 삭제

module.exports = router;
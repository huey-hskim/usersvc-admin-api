const createApiRouter = require('../../middleware/createApiRouter');
const auth = new (require('./authenticate'))();

const router = createApiRouter({prefix: '/auth', authorization: auth});

const authApi = require('./1.0/api');

router.post   ('/login'       , auth.optional , authApi.login);
// router.post   ('/refresh'     , auth.optional , authApi.refresh);    // 어드민은 토큰 갱신 지원하지 않기..
router.post   ('/logout'                      , authApi.logout);
router.put    ('/passwd'                      , authApi.putPasswd);
router.patch  ('/passwd'                      , authApi.putPasswd);

module.exports = router;
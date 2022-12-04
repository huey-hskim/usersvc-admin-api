const {QueryHelper} = require("./queryHelper");

//table_name, keys, is_autoincrement_key, fields, fields_ex, fields_ondupl_update, fields_soft_deleted

module.exports = {
  admin_tbl: new QueryHelper( {
    table_name          : 'admin_tbl',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['id'],
    fields_ex           : ['created_by', 'leaved_by', 'created_at', 'leaved_at', 'deleted_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : ['leaved_at', 'now()', 'leaved_by'] }),
  admin_shadow_tbl: new QueryHelper({
    table_name          : 'admin_shadow_tbl',
    keys                : ['admin_no'],
    is_autoincrement_key: false,
    fields              : ['passwd', 'prev'],
    fields_ex           : ['created_by', 'updated_by', 'created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),
  admin_info_tbl: new QueryHelper({
    table_name          : 'admin_info_tbl',
    keys                : ['admin_no'],
    is_autoincrement_key: false,
    fields              : ['admin_name', 'admin_phone', 'admin_rank', 'user_no', 'comments'],
    fields_ex           : ['created_by', 'updated_by', 'created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),
  admin_role_tbl: new QueryHelper({
    table_name          : 'admin_role_tbl',
    keys                : ['admin_no'],
    is_autoincrement_key: false,
    fields              : ['role_name', 'role_code'],
    fields_ex           : ['created_by', 'updated_by', 'created_at', 'updated_at', 'deleted_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : ['deleted_at', 'now()', 'deleted_by'] }),
  admin_operation_log: new QueryHelper({
    table_name          : 'admin_operation_log',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['base_url', 'url', 'method', 'data', 'comments'],
    fields_ex           : ['created_by', 'created_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),
  admin_operation_log_view: new QueryHelper({
    table_name          : 'admin_operation_log_view',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['base_url', 'method', 'comments', 'admin_name', 'created_at'],
    fields_ex           : ['url', 'data', 'created_by'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),
  admin_info_view: new QueryHelper({
    table_name          : 'admin_info_view',
    keys                : ['admin_no'],
    is_autoincrement_key: false,
    fields              : ['admin_id', 'admin_name', 'admin_phone', 'admin_rank', 'user_no'],
    fields_ex           : ['created_by', 'updated_by', 'created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : ['leaved_at'] }),


  banner_tbl: new QueryHelper({
    table_name          : 'banner_tbl',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['type', 'imgurl', 'linkurl', 'display_order', 'open_at', 'close_at'],
    fields_ex           : ['testers', 'is_open', 'created_by', 'updated_by', 'deleted_at', 'created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : ['deleted_at', 'now()', 'deleted_by'] }),

  board_faq_tbl: new QueryHelper({
    table_name          : 'board_faq_tbl',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['category', 'title', 'contents', 'display_order', 'open_at', 'close_at'],
    fields_ex           : ['testers', 'is_open', 'created_by', 'updated_by', 'deleted_at', 'created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : ['deleted_at', 'now()', 'deleted_by'] }),
  board_notice_tbl: new QueryHelper({
    table_name          : 'board_notice_tbl',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['category', 'title', 'contents', 'display_order', 'open_at', 'close_at'],
    fields_ex           : ['testers', 'is_open', 'created_by', 'updated_by', 'deleted_at', 'created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : ['deleted_at', 'now()', 'deleted_by'] }),

  inquiry_chat_tbl: new QueryHelper({
    table_name          : 'inquiry_chat_tbl',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['user_no', 'seq', 'conversation_id', 'resolved', 'resolved_at', 'direction', 'category', 'title', 'contents', 'imgurl'],
    fields_ex           : ['resolved_by', 'confirm_by', 'created_by', 'updated_by', 'deleted_at', 'created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : ['deleted_at', 'now()', 'deleted_by'] }),

  inquiry_chat_view: new QueryHelper({
    table_name          : 'inquiry_chat_view',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['user_no', 'seq', 'conversation_id', 'resolved', 'direction', 'category', 'title', 'contents', 'imgurl', 'uname'],
    fields_ex           : ['id', 'phone', 'resolved_at', 'resolved_by', 'confirm_by', 'created_by', 'updated_by', 'deleted_at', 'created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : ['deleted_at', 'now()', 'deleted_by'] }),

  postbox_queue_common_tbl: new QueryHelper({
    table_name          : 'postbox_queue_common_tbl',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['status', 'to_type', 'to_go', 'to_tester', 'situation_code', 'template_code', 'category', 'msg_title', 'msg_body', 'msg_click_action', 'params', 'buttons', 'reservation_at', 'sent_at', 'froms'],
    fields_ex           : ['deleted_by', 'created_by', 'updated_by', 'deleted_at', 'created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : ['deleted_at', 'now()', 'deleted_by'],
    fields_json_convert : ['to_go'] }),

  postbox_queue_autogen_tbl: new QueryHelper({
    table_name          : 'postbox_queue_autogen_tbl',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['status', 'to_type', 'to_go', 'to_tester', 'situation_code', 'template_code', 'category', 'msg_title', 'msg_body', 'msg_click_action', 'params', 'buttons', 'reservation_at', 'sent_at', 'froms'],
    fields_ex           : ['deleted_by', 'created_by', 'updated_by', 'deleted_at', 'created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : ['deleted_at', 'now()', 'deleted_by'] }),

  user_postbox_autogen_view: new QueryHelper({
    table_name          : 'user_postbox_autogen_view',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['status', 'category', 'msg_title', 'msg_body', 'msg_click_action', 'reservation_at', 'sent_at', 'froms', 'created_at', 'opened_at'],
    fields_ex           : ['to_type', 'to_go', 'deleted_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : ['deleted_at', 'now()', 'deleted_by'] }),

  user_postbox_common_view: new QueryHelper({
    table_name          : 'user_postbox_common_view',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['status', 'category', 'msg_title', 'msg_body', 'msg_click_action', 'reservation_at', 'sent_at', 'froms', 'created_at'],
    fields_ex           : ['to_type', 'to_go', 'deleted_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : ['deleted_at', 'now()', 'deleted_by'] }),

  postbox_open_at_tbl: new QueryHelper({
    table_name          : 'postbox_open_at_tbl',
    keys                : ['user_no'],
    is_autoincrement_key: false,
    fields              : ['open_at'],
    fields_ex           : ['created_at'],
    fields_ondupl_update: ['open_at'],
    fields_soft_deleted : [] }),
  postbox_open_log: new QueryHelper({
    table_name          : 'postbox_open_log',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['user_no', 'msg_no', 'froms'],
    fields_ex           : ['created_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),

  postbox_template_tbl: new QueryHelper({
    table_name          : 'postbox_template_tbl',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['status', 'template_code', 'category', 'msg_title', 'msg_body', 'msg_click_action', 'params', 'buttons'],
    fields_ex           : ['deleted_by', 'created_by', 'updated_by', 'deleted_at', 'created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),

  postbox_situation_tbl: new QueryHelper({
    table_name          : 'postbox_situation_tbl',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['situation_code', 'template_code', 'comments', 'reservation_time', 'delay_sec', 'status'],
    fields_ex           : ['deleted_by', 'created_by', 'updated_by', 'deleted_at', 'created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),

  postbox_template_view: new QueryHelper({
    table_name          : 'postbox_template_view',
    keys                : ['situation_code'],
    is_autoincrement_key: false,
    fields              : ['template_code', 'category', 'msg_title', 'msg_body', 'msg_click_action', 'params', 'buttons', 'status', 'reservation_time', 'delay_sec'],
    fields_ex           : [],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),

  postbox_send_log: new QueryHelper({
    table_name          : 'postbox_send_log',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['msg_no', 'status', 'froms', 'results'],
    fields_ex           : ['created_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),

  user_info_view: new QueryHelper({
    table_name          : 'user_info_view',
    keys                : ['user_no'],
    is_autoincrement_key: false,
    fields              : ['id', 'status', 'uname', 'phone', 'subscription_status'],
    fields_ex           : ['ci', 'di', 'birthdate', 'gender', 'nationalinfo', 'created_at', 'leaved_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : ['leaved_at', 'now()'] }),

  user_tbl: new QueryHelper({
    table_name          : 'user_tbl',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['id', 'status'],
    fields_ex           : ['created_at', 'leaved_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : ['leaved_at', 'now()'] }),
  user_shadow_tbl: new QueryHelper({
    table_name          : 'user_shadow_tbl',
    keys                : ['user_no'],
    is_autoincrement_key: false,
    fields              : ['passwd', 'prev'],
    fields_ex           : ['created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),
  user_info_tbl: new QueryHelper({
    table_name          : 'user_info_tbl',
    keys                : ['user_no'],
    is_autoincrement_key: false,
    fields              : ['uname', 'phone', 'ci', 'di', 'birthdate', 'gender', 'nationalinfo', 'comments'],
    fields_ex           : ['created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),
  user_agreement_tbl: new QueryHelper({
    table_name          : 'user_agreement_tbl',
    keys                : ['user_no', 'type'],
    is_autoincrement_key: false,
    fields              : ['agreement'],
    fields_ex           : ['created_at', 'updated_at'],
    fields_ondupl_update: ['agreement', 'updated_at'],
    fields_soft_deleted : [] }),
  user_push_token_tbl: new QueryHelper({
    table_name          : 'user_push_token_tbl',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['user_no', 'token', 'type', 'os_type'],
    fields_ex           : ['comments', 'created_at', 'updated_at'],
    fields_ondupl_update: ['token', 'os_type', 'updated_at'],
    fields_soft_deleted : [] }),
  user_kv_inventory_tbl: new QueryHelper({
    table_name          : 'user_kv_inventory_tbl',
    keys                : ['user_no', 'name'],
    is_autoincrement_key: false,
    fields              : ['value'],
    fields_ex           : ['created_at', 'updated_at'],
    fields_ondupl_update: ['value', 'updated_at'],
    fields_soft_deleted : [] }),

  user_ci_req_log: new QueryHelper({
    table_name          : 'user_ci_req_log',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : [],
    fields_ex           : [],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),


  subscribe_tbl: new QueryHelper({
    table_name          : 'subscribe_tbl',
    keys                : ['user_no'],
    is_autoincrement_key: false,
    fields              : [],
    fields_ex           : [],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),

  app_version_tbl: new QueryHelper({
    table_name          : 'app_version_tbl',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['type', 'code', 'name'],
    fields_ex           : ['created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),


  audit_log: new QueryHelper({
    table_name          : 'audit_log',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['user_no', 'user_id', 'is_refresh', 'errCode'],
    fields_ex           : ['created_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),

  session_tbl: new QueryHelper({
    table_name          : 'session_tbl',
    keys                : ['no'],
    is_autoincrement_key: true,
    fields              : ['user_no', 'hash'],
    fields_ex           : ['created_at', 'updated_at', 'expired_at'],
    fields_ondupl_update: ['hash', 'updated_at'],
    fields_soft_deleted : [] }),


  stat_curr_dashboard: new QueryHelper({
    table_name          : 'stat_curr_dashboard',
    keys                : ['stat_tm'],
    is_autoincrement_key: false,
    fields              : ['user_total', 'user_join', 'user_leave', 'visit_total', 'visit_user', 'visit_refresh', 'visit_fail', 'inquiry_total', 'inquiry_resolved', 'inquiry_unresolved', 'subscription_total', 'subscription_new', 'subscription_renew'],
    fields_ex           : ['created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),

  stat_hour_dashboard: new QueryHelper({
    table_name          : 'stat_hour_dashboard',
    keys                : ['stat_tm'],
    is_autoincrement_key: false,
    fields              : ['user_total', 'user_join', 'user_leave', 'visit_total', 'visit_user', 'visit_refresh', 'visit_fail', 'inquiry_total', 'inquiry_resolved', 'inquiry_unresolved', 'subscription_total', 'subscription_new', 'subscription_renew'],
    fields_ex           : ['created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),

  stat_day_dashboard: new QueryHelper({
    table_name          : 'stat_day_dashboard',
    keys                : ['stat_tm'],
    is_autoincrement_key: false,
    fields              : ['user_total', 'user_join', 'user_leave', 'visit_total', 'visit_user', 'visit_refresh', 'visit_fail', 'inquiry_total', 'inquiry_resolved', 'inquiry_unresolved', 'subscription_total', 'subscription_new', 'subscription_renew'],
    fields_ex           : ['created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),

  stat_month_dashboard: new QueryHelper({
    table_name          : 'stat_month_dashboard',
    keys                : ['stat_tm'],
    is_autoincrement_key: false,
    fields              : ['user_total', 'user_join', 'user_leave', 'visit_total', 'visit_user', 'visit_refresh', 'visit_fail', 'inquiry_total', 'inquiry_resolved', 'inquiry_unresolved', 'subscription_total', 'subscription_new', 'subscription_renew'],
    fields_ex           : ['created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),

  stat_year_dashboard: new QueryHelper({
    table_name          : 'stat_year_dashboard',
    keys                : ['stat_tm'],
    is_autoincrement_key: false,
    fields              : ['user_total', 'user_join', 'user_leave', 'visit_total', 'visit_user', 'visit_refresh', 'visit_fail', 'inquiry_total', 'inquiry_resolved', 'inquiry_unresolved', 'subscription_total', 'subscription_new', 'subscription_renew'],
    fields_ex           : ['created_at', 'updated_at'],
    fields_ondupl_update: [],
    fields_soft_deleted : [] }),

}
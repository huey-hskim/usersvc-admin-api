const child_process = require('child_process');
const { WebClient } = require('@slack/web-api');
const _ = require("lodash");

const slack_token = _.get(global, 'config.scheduler.sysmon.slack.token', '');
const slack_channel = _.get(global, 'config.scheduler.sysmon.slack.channel_name', 'system-alarm');

const used_high = Number.parseInt(_.get(global, 'config.scheduler.sysmon.disk.used_high', "90"));

const service_name = process.env.SERVICE_NAME || process.env.hostname || process.env.HOSTNAME || 'nugunyanun';

module.exports = {
  check: async (param) => {
    param.lastActionTm = new Date();
    param.status = 0;

    console.log(`on ${param.name}`);

    let dfInfo = '';
    try {
      dfInfo = await child_process.execSync('df -h / | tail -1');
      dfInfo = dfInfo.toString().trim();
    } catch (e) {
      console.log('!ERR df -h', e.message || e || 'unknown');
    }

    let infos = dfInfo.split(/\s+/);
    console.log(dfInfo);

    let capacity = infos && infos.length > 4 && Number.parseInt(infos[4].replace('%',''));

    if (capacity > used_high) {
      if (slack_token) {
        try {
          const web = new WebClient(slack_token);
          const result = await web.chat.postMessage({
            text: `[${service_name}] ${dfInfo}`,
            channel: slack_channel,
          });
        } catch (e) {
          console.log('!ERR slack postMessage : ', e.message || e || 'unknown');
        }
      } else {
        console.log('!ERR undefined slack_token');
      }
    }

    console.log(`end ${param.name}`);
  },
};

// (async () => {
//   module.exports.check({});
// }) ();

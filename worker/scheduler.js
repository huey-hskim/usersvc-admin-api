const { CronJob } = require('cron');

const sysmon = require('../works/sysmon');

const modules = {
  sysmon,
};

const worker = {
  modules: modules,

  works: [
    // { schedule: '30 * * * *  ' , module: 'rblogd'        , proc: 'clean'  , name: 'rblogd.clean'         , status: 0, lastActionTm: null, jobObj: null, autoStart: false },
  ],

  status: false,

  start: (wks) => {
    if(wks) {
      const list = wks.split('|');
      for (let l of list) {
        const v = l.split('__');
        if(v.length === 3) { // * * * * *__postbox__proc
          worker.works.push({
            schedule      : v[0],
            module        : v[1],
            proc          : v[2],
            name          : `${v[1]}.${v[2]}`,
            status        : 0,
            lastActionTm  : null,
            jobObj        : null,
            autoStart     : true
          });
        } else if(v.length === 4) { // * * * * *__postbox__proc__true
          worker.works.push({
            schedule      : v[0],
            module        : v[1],
            proc          : v[2],
            name          : `${v[1]}.${v[2]}`,
            status        : 0,
            lastActionTm  : null,
            jobObj        : null,
            autoStart     : v[3] === 'true'
          });
        }
      }

      for (let o of worker.works) {
        o.jobObj = new CronJob(o.schedule, modules[o.module][o.proc], o);
        o.autoStart && o.jobObj.start();
      }
      worker.status = true;
    }
  },

  stop: (name) => {
    for (let o of worker.works) {
      if (name) {
        if (name === o.name) {
          o.jobObj && o.jobObj.stop && o.jobObj.stop();
          return;
        }
      } else {
        o.jobObj && o.jobObj.stop && o.jobObj.stop();
        worker.status = false;
      }
    }
  }
};

// worker.start();

module.exports = worker;


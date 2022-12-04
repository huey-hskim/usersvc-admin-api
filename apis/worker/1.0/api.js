const _ = require('lodash');

const { ErrorCode } = require('../../../usersvc-common/constant/consts');

const DaoStat = require('../1.0/dao');

const stat = {
  get: async (req, res) => {

    let worker = global.worker.works.map( (i) => {
      return {
        schedule:     i.schedule,
        module:       i.module,
        proc:         i.proc,
        name:         i.name,
        status:       i.status,
        lastActionTm: i.lastActionTm,
        autoStart:    i.autoStart
      };
    } );

    res.payload = {
      data: worker
    }
  },
};

const fire = {
  any: async (req, res) => {

    const { module, proc } = req.params;

    const proc_name = `${module}.${proc}`;

    let output = {
      found: false
    };

    for await ( let o of global.worker.works ) {
      if ( o.name === proc_name) {
        try {
          o.jobObj && o.jobObj.fireOnTick && ((output.found = true) && o.jobObj.fireOnTick());
        } catch (e) {
          output.message = 'proc exception occurred';
          output.e = e;
        }
        break;
      }
    }

    res.payload = {
      data: {
        ...output
      }
    }
  },
};

module.exports = {
  stat: stat,
  fire: fire,
};
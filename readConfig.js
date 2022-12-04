const mode = process.env.NODE_ENV || 'production';

const path      = require('path');

const config_parser_recursive = (key, val, config, keys, max_level, level) => {

  //끝까지 왔다.
  if (max_level === level) {
    return true;
  }

  //키가 없다.
  if (typeof config[keys[level]] === 'undefined') {
    return false;
  }

  //아래로..
  if( config_parser_recursive(key, val, config[keys[level]], keys, max_level, level+1) ) {
    const origin_type = typeof config[keys[level]];
    const target_type = typeof val;
    if ( origin_type ===  target_type ) {
      config[keys[level]] = val;
    } else {
      if ( origin_type === 'boolean' && target_type === 'string') {
        config[keys[level]] = (val === 'true');
      } else {
        console.log(`ERR! unexpected config type '${key}:(${typeof config[keys[level]]}, ${typeof val})'`);
        process.exit(-1);
      }
    }
  }

  return false;
};

const config_parser = (key, val, deli, config) => {

  //key: 'config__database__mysql__Master__host', val: 'mysql', deli: '--';
  //keys: [config, database, mysql, Master, host]
  //config: config.database.mysql.Master.host
  const keys = key.split(deli);

  if(keys[0] === 'config') {
    config_parser_recursive(key, val, config, keys, keys.length, 1);
  }
};

module.exports = async (server) => {

  if (mode) {
    try {
      const workingdir = process.cwd();
      const config = require(`${workingdir}/config.${mode}.js`);

      //env
      const {
        mysql_master_host       ,
        mysql_master_port       ,
        mysql_master_user       ,
        mysql_master_pass       ,
        mysql_master_db         ,
        https_off               ,
        cors_white_list         ,
        apphome_home            ,
        apphome_error           ,
        dev_mode,
      } = process.env;

      for (let o of Object.keys(process.env)) {
        if(o.startsWith('config__')) {
          config_parser(o, process.env[o], '__', config);
        }
      }

      mysql_master_host && (config.database.mysql.Master.host     = mysql_master_host);
      mysql_master_port && (config.database.mysql.Master.port     = mysql_master_port);
      mysql_master_user && (config.database.mysql.Master.user     = mysql_master_user);
      mysql_master_pass && (config.database.mysql.Master.password = mysql_master_pass);
      mysql_master_db   && (config.database.mysql.Master.database = mysql_master_db  );

      https_off         && (config.secureOptions = {});

      cors_white_list                     && (config.cors_white_list = cors_white_list.split('|'));

      apphome_home                        && (config.apphome.home = apphome_home);
      apphome_error                       && (config.apphome.error = apphome_error);
      //

      config.workingdir = workingdir;

      server.config = config;
      global.config = config;
    } catch (e) {
      console.error(`Not Found 'config.${mode}.js'`);
      process.exit(-1);
    }
  } else {
    console.error(`[ERROR] Unknown mode [${mode}]`);
    process.exit(-1);
  }
};
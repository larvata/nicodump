const HttpsProxyAgent = require('https-proxy-agent');

let httpAgent = null;
if (process.env.https_proxy) {
  httpAgent = new HttpsProxyAgent(process.env.https_proxy);
}

const NICO_COMMAND = {
  // timeshift
  PING_PONG: 'pingpong',
  PLAYER_VERSION: 'playerversion',
  GET_PERMIT: 'getpermit',
  WATCHING: 'watching',
  CURRENT_STREAM: 'currentstream',
  CURRENT_ROOM: 'currentroom',
  WATCHING_INTERVAL: 'watchinginterval',

  // timeshift, should ignored
  SCHEDULE: 'schedule',
  SERVER_TIME: 'servertime',
  PERMIT: 'permit',
  STATISTICS: 'statistics',
  UPDATE: 'update',
};

const COMMAND_IGNORE_LIST = [
  NICO_COMMAND.WATCHING_INTERVAL,
  NICO_COMMAND.STATISTICS,
  NICO_COMMAND.SERVER_TIME,
  NICO_COMMAND.PERMIT,
  NICO_COMMAND.UPDATE,
];

module.exports = {
  NICO_COMMAND,
  COMMAND_IGNORE_LIST,
  HTTP_AGENT: httpAgent,
};

const fs = require('fs');
const EventEmitter = require('events');

const curlParser = require('parse-curl');

const TimeshiftService = require('./timeshift-service');
const CommentService = require('./comment-service');

// const {
//   NICO_COMMAND,
//   COMMAND_IGNORE_LIST,
// } = require('./constants');

// const {
//   getRequest,
//   decodeEntities,
// } = require('./utils');



class NicoClientEmulator extends EventEmitter {
  constructor(options) {
    super();

    this.options = options;

    const curlCommand = fs.readFileSync(this.options.cookies, 'utf8');
    const { header: headers } = curlParser(curlCommand);
    headers.Cookie = headers.$Cookie || headers.Cookie;
    delete headers.$Cookie;
    delete headers['Content-Length'];


    this.timeshift = new TimeshiftService(this.options, headers);

    this.timeshift.on('hls', (params) => {
      this.emit('hls', params);
    });

    this.timeshift.on('currentroom', (liveInfo) => {
      // return;
      const comment = new CommentService(liveInfo, headers);
      comment.start();
    });
  }

  // public
  start() {
    console.log('nico start');
    this.timeshift.start();

  }
}


module.exports = NicoClientEmulator;

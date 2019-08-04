const { CookieMap } = require('cookiefile');
const EventEmitter = require('events');

const TimeshiftService = require('./timeshift-service');
const CommentService = require('./comment-service');


class NicoClientEmulator extends EventEmitter {
  constructor(options) {
    super();

    this.options = options;

    const cookieFile = new CookieMap(this.options.cookies);

    const cookies = cookieFile.toRequestHeader();
    const headers = { cookie: cookies };

    this.timeshift = new TimeshiftService(this.options, headers);

    this.timeshift.on('hls', (params) => {
      this.emit('hls', params);
    });

    this.timeshift.on('currentroom', (liveInfo) => {
      // TODO the comment dump is disabled temporary
      return;
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

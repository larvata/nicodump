const EventEmitter = require('events');

const WebSocket = require('ws');

const {
  NICO_COMMAND,
  COMMAND_IGNORE_LIST,
} = require('./constants');

const {
  getRequest,
  decodeEntities,
} = require('./utils');

class TimeshiftService extends EventEmitter {
  constructor(options, headers) {
    super();

    this.wssTimeshift = null;
    this.options = options;

    this.request = getRequest(headers);
  }

  // private done
  buildCommand(command) {
    const result = {
      type: 'watch',
      body: {
        command,
      },
    };

    if (command === NICO_COMMAND.PING_PONG) {
      result.type = 'pong';
      result.body = {};
    }
    else if (command === NICO_COMMAND.PLAYER_VERSION) {
      result.body.params = ['leo'];
    }
    else if (command === NICO_COMMAND.GET_PERMIT) {
      result.body.requirement = {
        broadcastId: this.liveInfo.broadcastId,
        route: '',
        stream: {
          protocol: 'hls',
          requireNewStream: true,
          priorStreamQuality: this.liveInfo.maxQuality,
          isLowLatency: true,
        },
        room: {
          isCommentable: true,
          protocol: 'webSocket',
        },
      };
    }
    else if (command === NICO_COMMAND.WATCHING) {
      result.body.params = [this.liveInfo.broadcastId, '-1', '0'];
    }

    return JSON.stringify(result);
  }

  // private
  timeshiftHeartbeat() {
    setInterval(() => {
      const cmd = this.buildCommand(NICO_COMMAND.WATCHING);
      console.log('heartbeat');
      this.wssTimeshift.send(cmd);
    }, this.liveInfo.watchingInterval * 1000);
  }

  // private
  timeshiftResponsor(data) {
    const {
      type,
      body,
      body: {
        command,
      },
    } = JSON.parse(data);

    let result = null;

    if (type === 'ping') {
      result = this.buildCommand(NICO_COMMAND.PING_PONG);
      this.emit('pong');
    }
    else if (command === NICO_COMMAND.CURRENT_STREAM) {
      this.liveInfo.currentStream = body.currentStream;
      this.emit('hls', body.currentStream.uri);
    }
    else if (command === NICO_COMMAND.CURRENT_ROOM) {
      this.liveInfo.room = body.room;
      this.emit('currentroom', this.liveInfo);
    }
    else if (command === NICO_COMMAND.WATCHING_INTERVAL) {
      console.log('start timeshift heartbeat');
      this.liveInfo.watchingInterval = +body.params[0];
      this.timeshiftHeartbeat();
    }
    else if (COMMAND_IGNORE_LIST.includes(command)) {
      // ignore them
    }
    else {
      console.log('Unhandled command:', body);
    }

    return result;
  }

  // private done
  timeshiftOpenHandler() {
    const cmdPlayerVersion = this.buildCommand(NICO_COMMAND.PLAYER_VERSION);
    this.wssTimeshift.send(cmdPlayerVersion);

    const cmdGetPermit = this.buildCommand(NICO_COMMAND.GET_PERMIT);
    this.wssTimeshift.send(cmdGetPermit);
  }

  // private done
  timeshiftMessageHandler(data) {
    const respond = this.timeshiftResponsor(data);

    if (respond) {
      this.wssTimeshift.send(respond);
    }
  }

  // private
  getTimeshiftMetadata() {
    return this.request({ url: this.options.url })
      .then(({ body }) => {
        // extract data-props from live page
        const match = body.match(/data-props="([^"]*)"/);

        const liveInfo = JSON.parse(decodeEntities(match[1]));
        const {
          site: {
            relive: {
              webSocketUrl,
            },
          },
          program: {
            nicoliveProgramId,
            broadcastId,
            beginTime,
            endTime,
            stream: {
              maxQuality,
            },
          },
          user: {
            id: userId,
          },
        } = liveInfo;

        const result = {
          webSocketUrl,
          nicoliveProgramId,
          broadcastId,
          userId,
          beginTime,
          endTime,
          maxQuality,
        };

        return result;
      });
  }

  start() {
    this.getTimeshiftMetadata().then((result) => {
      this.liveInfo = result;

      const { webSocketUrl } = this.liveInfo;

      const wssUrl = `${webSocketUrl}&frontend_id=9`;
      this.wssTimeshift = new WebSocket(wssUrl);

      this.wssTimeshift.on('open', this.timeshiftOpenHandler.bind(this));
      this.wssTimeshift.on('message', this.timeshiftMessageHandler.bind(this));
    });
  }
}

module.exports = TimeshiftService;

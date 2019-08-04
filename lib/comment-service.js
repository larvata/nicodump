const fs = require('fs');
const EventEmitter = require('events');

const WebSocket = require('ws');

const {
  getRequest,
} = require('./utils');

class CommentService extends EventEmitter {
  constructor(liveInfo, headers) {
    super();

    this.liveInfo = liveInfo;
    this.request = getRequest(headers);
  }

  buildCommand(idx = 0, res) {
    const requestIndex = idx;
    const packageIndex = idx * 5;

    // console.log( this.liveInfo);

    const {
      room: {
        threadId,
      },
      userId,
      beginTime,
      endTime,
      waybackkey,
    } = this.liveInfo;

    const when = (beginTime + (90 * idx));
    if (when > endTime) {
      return null;
    }

    const result = [];
    result.push({
      ping: {
        content: `rs:${requestIndex}`,
      },
    });

    result.push({
      ping: {
        content: `ps:${packageIndex}`,
      },
    });

    result.push({
      thread: {
        thread: threadId,
        version: '20061206',
        fork: 0,
        when: when.toFixed(3).toString(),
        user_id: userId,
        res_from: (res || -200),
        with_global: 1,
        scores: 1,
        nicoru: 0,
        waybackkey,
      },
    });

    result.push({
      ping: {
        content: `pf:${requestIndex}`,
      },
    });

    result.push({
      ping: {
        content: `rf:${packageIndex}`,
      },
    });

    return JSON.stringify(result);
  }


  dumpComment() {
    const chatList = [];
    let commentIndex = 0;
    let fromRes = -200;

    const {
      room: {
        messageServerUri,
      },
      nicoliveProgramId,
    } = this.liveInfo;

    console.log('start comment wss:', messageServerUri);
    const wss = new WebSocket(messageServerUri, 'msg.nicovideo.jp#json');
    wss.on('open', () => {
      const cmd = this.buildCommand();
      wss.send(cmd);
    });

    wss.on('message', (data) => {
      const json = JSON.parse(data);
      // console.log('->', data);

      if (json.ping) {
        if (json.ping.content.includes('rf:')) {
          // request finish
          commentIndex += 1;

          const cmd = this.buildCommand(commentIndex, fromRes);
          if (cmd) {
            console.log('comments:', chatList.length);
            wss.send(cmd);
          }
          else {
            console.log('comments dump done:', chatList.length);
            fs.writeFileSync(`comments/${nicoliveProgramId}-comment.json`, JSON.stringify(chatList, null, 2));
            wss.close();
            // TODO emit finish state timeshift service should also close the wss connection
          }
        }
      }
      else if (json.thread) {
        // update res value
        fromRes = json.thread.last_res + 1;
      }
      else if (json.chat) {
        chatList.push(json.chat);
      }
    });
  }

  start() {
    const {
      threadId,
    } = this.liveInfo.room;

    // get way back key
    const waybackUrl = `https://live.nicovideo.jp/api/getwaybackkey?thread=${threadId}`;
    this.request({ url: waybackUrl })
      .then(({ body }) => {
        ([, this.liveInfo.waybackkey] = body.split('='));
      })
      .then(() => {
        this.dumpComment();
      });
  }
}

module.exports = CommentService;

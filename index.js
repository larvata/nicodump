const meow = require('meow');

const NicoClientEmulator = require('./lib');

function showVersion(pkg) {
  console.log(`nicodump v${pkg.version}`);
}

function showHelp(pkg) {
  showVersion(pkg);
//   console.log(`
//   Usage:
//   $ nicodump [options] <live-id>

//   Options:
//     --help, -h  this message
//     --version, -v  show version
//     --dry-run, -r  extract the live metadata only
//     --cookie, -c  import cookie for authentication
//     --video, -vo  dump the video only
//     --comment, -co  dump the comments only
//     --ffmpeg-path, -fp  set the ffmpeg path
// `);

  console.log(`
  Usage:
  $ nicodump [options] <live-id>

  Options:
    --help, -h  this message
    --version, -v  show version
    --cookie, -c  import cookie for authentication
`);
}

const cli = meow({
  flags: {
    version: {
      type: 'boolean',
      alias: 'v',
    },
    help: {
      type: 'boolean',
      alias: 'h',
    },
    cookies: {
      type: 'string',
      alias: 'c',
    },
    dryRun: {
      type: 'boolean',
      alias: 'r',
    },
    auth: {
      type: 'boolean',
      alias: 'a',
    },
    video: {
      type: 'boolean',
    },
    comment: {
      type: 'boolean',
    },
  },
  autoHelp: false,
  autoVersion: false,
});

const { pkg, flags, input } = cli;

if (flags.version) {
  showVersion(pkg);
  process.exit();
}

if (flags.help) {
  showHelp(pkg);
  process.exit();
}

if (!flags.cookies) {
  console.log('Parameter: "cookies" is required.');
  process.exit();
}

if (!input[0]) {
  console.log('A video id should be specified.');
  process.exit();
}

const liveId = input[0];
if (!/^lv\d+/.test(liveId)) {
  console.log('An valid live id is required (lvXXXXXXXX).');
  process.exit();
}

const options = {
  liveId,
  video: flags.video || !flags.comment,
  comment: flags.comment || !flags.video,
  url: `https://live2.nicovideo.jp/watch/${liveId}`,
  cookies: flags.cookies,
};

const nico = new NicoClientEmulator(options);

nico.on('progress', () => {

});

nico.on('hls', (url) => {
  console.log('HLS:');
  console.log(url);
});

nico.start();

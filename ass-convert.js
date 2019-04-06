// const pixelWidth = require('string-pixel-width');

// const width = pixelWidth('きたあああああああ', {
//   size: 20,
//   font: 'Hiragino Kaku Gothic Pro',
// });

// console.log('This text is ' + width + 'px long in the size of 10px.');

const fs = require('fs');

const { createCanvas } = require('canvas');
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');

const CPS = 20;
const ON_SCREEN_TIME = 8;
const FONT_NAME = '40px Hiragino Kaku Gothic Pro';
const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;
const COMMENT_PADDING = 10;
const COMMENT_CANVAS_PADDING = 20;
const COMMENT_GAP = 50;

// Write "Awesome!"
ctx.font = FONT_NAME;
// ctx.fillText('きたあああああああ', 50, 100);

// Draw line under text
// const text = ctx.measureText('きたあああああああ');
// console.log('length:', text.width);



const arrayAdd = (array1, array2) => {

  if (array2.length > array1.length) {
    array1.length = array2.length;
  }

  array2.forEach((c, i) => {
    const newVal = (array1[i] || 0) + c;
    array1[i] = newVal;
  });
};








const comments = require('./comments/lv318485444-comment.json');
console.log('count:', comments.length);

const getCommentSecond = (comment) => {
  // const begin = (comment.date - BEGIN_TIME);
  const begin = comment.vpos / 100;
  const end = begin + ON_SCREEN_TIME;
  return { begin, end };
};

const getCommentColumnSize = (comment, emHeightAscent) => {
  const { width } = comment;
  return parseInt(width / (COMMENT_PADDING * 2 + emHeightAscent), 10);
};

const convertToAssTime = (totalSeconds) => {
  const totalMinutes = parseInt(totalSeconds / 60, 10);
  const totalHours = parseInt(totalMinutes / 60, 10);

  const hours = totalHours;
  const minutes = totalMinutes % 60;
  const seconds = (totalSeconds % 60).toFixed(2);

  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const buildTimeString = (comment) => {
  const { begin, end } = comment;

  const bt = convertToAssTime(begin);
  const et = convertToAssTime(end);

  return `${bt},${et}`;
};


// prepare
let { emHeightAscent, commentList } = comments
  // .sort((a, b) => (a.vpos - b.vpos))
  .reduce((a, b) => {
    const { emHeightAscent: height, width } = ctx.measureText(b.content);
    a.emHeightAscent = (height < a.emHeightAscent) ? a.emHeightAscent : height;
    const { begin, end } = getCommentSecond(b);

    // filter command comment
    !b.content.startsWith('/') && !b.content.startsWith('<') && a.commentList.push({
      content: b.content,
      width,
      begin,
      end,
    });

    return a;
  }, { emHeightAscent: 0, commentList: [] });

// sort comment list
commentList = commentList.sort((a, b) => {
  return a.begin - b.begin
});


const periodCellSize = (COMMENT_PADDING * 2 + emHeightAscent);
const lineCount = parseInt((VIDEO_HEIGHT - COMMENT_CANVAS_PADDING * 2) / periodCellSize, 10);
const columnCount = parseInt(VIDEO_WIDTH / periodCellSize, 10);
// for (let l = 0; l < lineCount; l++) {
//   for (let c = 0; c < columnCount; c++) {
//     stageGrid
//   }
// }
let stageGrid = [];
for (let i = 0; i < lineCount; i++) {
  stageGrid.push([]);;
}



// column move per second
const period = parseInt(columnCount / ON_SCREEN_TIME, 10);


// const [firstComemnt] = commentList;
// const [lastComment] = commentList.slice(-1);

// const { begin: firstCommentBegin } = firstComemnt;
// const { begin: lastCommentBegin } = lastComment;

// console.log('firstCommentBegin:', firstCommentBegin);

let lastCommentBegin = 0;

const commentEntities = commentList.map((c) => {
  const { begin } = c;
  const columns = getCommentColumnSize(c, emHeightAscent);

  const shiftedPeriod = parseInt((begin - lastCommentBegin) / period, 10);
  if (shiftedPeriod > 0) {
    // shift stage
    stageGrid.forEach(l => l.splice(0, shiftedPeriod));
  }

  lastCommentBegin = begin;

  // const getLineStatus = (line, index) => {
  //   return {
  //     index,
  //     raw: line,
  //     length: line.length,
  //     // free: line.join('').split(1).slice(-1)[0].length,
  //   };
  // };


  // // find better position
  // const scores = stageGrid.reduce((a, b, index) => {
  //   if (!a) {
  //     return getLineStatus(b, index);
  //   }

  //   if (!a.length) {
  //     // target line is clean no need to try others
  //     return a;
  //   }

  //   const bs = getLineStatus(b, index);

  //   if (bs.length < a.length) {
  //     return bs;
  //   }

  //   // if (bs.free > a.free) {
  //   //   return bs;
  //   // }




  //   return a;
  // }, null);

  // find better line to place new comment
  // const target = stageGrid.reduce((a, b, i) => {
  //   if (a.stageLine.length > b.length) {
  //     return {
  //       index: i,
  //       stageLine: b,
  //     };
  //   }
  //   return a;
  // }, {
  //   index: 0,
  //   stageLine: ' '.repeat(999),
  // });


  // find better line to place new comment
  // mark score
  const lineScores = stageGrid.map((l, i) => {
    const score = (l[0] || 0) * l.length;
    return {
      index: i,
      score,
    };
  });

  const bestLine = lineScores.sort((a, b) => a.score - b.score)[0];


  console.log('Before:');
  console.log(stageGrid.map(l => l.join('')).join('\n'));


  // stageGrid[target.index] = (
  //   stageGrid[target.index].length > columns
  //     ? stageGrid[target.index]
  //     : Array(columns).fill(1)
  // );


  // add cell value
  // stageGrid[bestLine.index] =

  arrayAdd(stageGrid[bestLine.index], Array(columns).fill(1));







  console.log('Now:', bestLine.index);
  console.log(stageGrid.map(l => l.join('')).join('\n'));

  // build ass string
  const timeString = buildTimeString(c);

  const yPos = (bestLine.index + 1) * periodCellSize + COMMENT_CANVAS_PADDING;



  return `Dialogue: 0,${timeString},Nico,,0,0,0,,{\\move(${VIDEO_WIDTH + c.width},${yPos}, ${-c.width}, ${yPos})} ${c.content}`;


});

const tpl = fs.readFileSync('template.tpl', 'utf8');
const full = tpl + commentEntities.join('\n');
fs.writeFileSync('/Users/Larvata/Downloads/sutasuta.ass', full);
process.exit();

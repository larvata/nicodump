const request = require('request');
const { HTTP_AGENT } = require('./constants');

const getRequest = defaultHeaders => options => new Promise((resolve, reject) => {
  const requestOption = Object.assign({
    headers: defaultHeaders,
    gzip: true,
    agent: HTTP_AGENT,
  }, options);

  request(requestOption, (err, res, body) => {
    if (err) {
      return reject(err);
    }
    return resolve({ res, body });
  });
});

const decodeEntities = (encodedString) => {
  const translateRegex = /&(nbsp|amp|quot|lt|gt);/g;
  const translate = {
    nbsp: ' ',
    amp: '&',
    quot: '"',
    lt: '<',
    gt: '>',
  };
  return encodedString.replace(translateRegex, (match, entity) => {
    return translate[entity];
  }).replace(/&#(\d+);/gi, (match, numStr) => {
    const num = parseInt(numStr, 10);
    return String.fromCharCode(num);
  });
};

module.exports = {
  getRequest,
  decodeEntities,
};

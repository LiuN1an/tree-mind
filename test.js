const { parseQuery } = require("loader-utils");

module.exports = function (source, map) {
  console.log(source);
  return source;
};

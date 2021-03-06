'use strict';

var _require = require('validator');

const isFQDN = _require.isFQDN;


module.exports = function (str) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref$requireTld = _ref.requireTld;
  let requireTld = _ref$requireTld === undefined ? true : _ref$requireTld;
  var _ref$allowUnderscores = _ref.allowUnderscores;
  let allowUnderscores = _ref$allowUnderscores === undefined ? false : _ref$allowUnderscores;
  var _ref$allowTrailingDot = _ref.allowTrailingDot;
  let allowTrailingDot = _ref$allowTrailingDot === undefined ? false : _ref$allowTrailingDot;

  if (typeof str === 'string') {
    return isFQDN(str, {
      require_tld: requireTld,
      allow_underscores: allowUnderscores,
      allow_trailing_dot: allowTrailingDot
    });
  } else {
    return false;
  }
};
"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

module.exports = (() => {
  var ref = _asyncToGenerator(function* (value, _ref) {
    let block = _ref.block;
    let options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    return yield block(value, options);
  });

  return function (_x2, _x3) {
    return ref.apply(this, arguments);
  };
})();
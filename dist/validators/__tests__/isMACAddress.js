'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const validator = require('../isMACAddress');

describe('isMACAddress', () => {

  it('fails when not a string', _asyncToGenerator(function* () {
    expect(validator(true)).toEqual(false);
  }));

  it('fails when invalid', _asyncToGenerator(function* () {
    expect(validator('01:02:03:04:05')).toEqual(false);
  }));

  it('passes when valid', _asyncToGenerator(function* () {
    expect(validator('ab:ab:ab:ab:ab:ab')).toEqual(true);
  }));
});
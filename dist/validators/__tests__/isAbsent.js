'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const validator = require('../isAbsent');

describe('isAbsent', () => {

  it('fails when not blank', _asyncToGenerator(function* () {
    expect(validator('text')).toEqual(false);
  }));

  it('passes when null', _asyncToGenerator(function* () {
    expect(validator(null)).toEqual(true);
  }));

  it('passes when undefined', _asyncToGenerator(function* () {
    expect(validator()).toEqual(true);
  }));

  it('passes when blank', _asyncToGenerator(function* () {
    expect(validator('')).toEqual(true);
  }));
});
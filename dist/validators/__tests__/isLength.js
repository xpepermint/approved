'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

var _require = require('../..');

const Approval = _require.Approval;
const ValidationError = _require.ValidationError;


let approval = new Approval();

describe('isLength', () => {

  it('fails if string size is not in the min/max range', _asyncToGenerator(function* () {
    try {
      yield approval.validateInput({
        name: 'John Smith'
      }, [{
        path: 'name',
        validator: 'isLength',
        options: { min: 3, max: 5 },
        message: 'must be between 5 and 10'
      }]);
    } catch (err) {
      expect(err.errors).toEqual([{ path: 'name', message: 'must be between 5 and 10' }]);
    }
  }));

  it('passes if string size is in the min/max range', _asyncToGenerator(function* () {
    try {
      yield approval.validateInput({
        name: 'John'
      }, [{
        path: 'name',
        validator: 'isLength',
        options: { min: 3, max: 5 },
        message: 'must be between 5 and 10'
      }]);
      expect(true).toEqual(true);
    } catch (err) {}
  }));
});
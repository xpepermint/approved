'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

var _require = require('..');

const Approval = _require.Approval;
const ValidationError = _require.ValidationError;


let approval = new Approval();

describe('validateInput', () => {

  it('throws a ValidationError on invalid input', _asyncToGenerator(function* () {
    try {
      yield approval.validateInput({}, [{
        path: 'name',
        validator: 'isPresent',
        message: 'must be present'
      }]);
    } catch (err) {
      expect(err instanceof ValidationError).toEqual(true);
    }
  }));
});

describe('handleError', () => {

  it('handles validation error', _asyncToGenerator(function* () {
    try {
      yield approval.validateInput({}, [{
        path: 'name',
        validator: 'isPresent',
        message: 'must be present'
      }]);
    } catch (err) {
      expect((yield approval.handleError(err))).toEqual([{ path: 'name', message: 'must be present' }]);
    }
  }));

  it('handles custom error', _asyncToGenerator(function* () {
    try {
      throw new Error('something went wrong');
    } catch (err) {
      expect((yield approval.handleError(err, [{
        path: 'system',
        error: 'Error',
        message: 'fake error'
      }]))).toEqual([{ path: 'system', message: 'fake error' }]);
    }
  }));
});
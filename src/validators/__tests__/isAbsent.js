const {Approval, ValidationError} = require('../..');

let approval = new Approval();

describe('isAbsent', () => {

  it('fails unless value is blank', async () => {
    try {
      await approval.validateInput({
        name: 'John'
      }, [{
        path: 'name',
        validator: 'isAbsent',
        message: 'must be blank'
      }]);
    } catch(err) {
      expect(err.errors).toEqual([{path: 'name', message: 'must be blank'}]);
    }
  });

});

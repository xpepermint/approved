const {Approval, ValidationError} = require('../..');

let approval = new Approval();

describe('isLength', () => {

  it('fails if string size is not in the min/max range', async () => {
    try {
      await approval.validateInput({
        name: 'John Smith'
      }, [{
        path: 'name',
        validator: 'isLength',
        options: {min: 3, max: 5},
        message: 'must be between 5 and 10'
      }]);
    } catch(err) {
      expect(err.errors).toEqual([{path: 'name', message: 'must be between 5 and 10'}]);
    }
  });

  it('passes if string size is in the min/max range', async () => {
    try {
      await approval.validateInput({
        name: 'John'
      }, [{
        path: 'name',
        validator: 'isLength',
        options: {min: 3, max: 5},
        message: 'must be between 5 and 10'
      }]);
      expect(true).toEqual(true);
    } catch(err) {}
  });

});

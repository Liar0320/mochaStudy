var expect = require("chai").expect;
var flag = [];
describe('Arrary', function () {
    it('should has length prototype', function () {
        expect(flag).to.have.lengthOf(0);
    });
});
describe('String', function () {
    it('should has length prototype', function () {
        expect(flag).to.have.lengthOf(0);
    });
});
describe('unit test.', function () {
    it('should also be able to test', function () {
        expect(true).to.equal(true);
    });
    it('should be failed', function () {
        expect(true).to.equal(false);
    });
});

/**
 * Created by syzer on 4/8/2015.
 */

var expect = require('chai').expect;
var _ = require('lodash');
var lib = require('../../lib/index.js')(_);

describe('lib', function () {
    var arr = [
        {prop1: {three: 1}}, {prop2: 2}, {prop2: 3}, {prop1: {three: 2, i: 1}},
        {prop3: 'other'}
    ];

    it('object merger adds correctly', function (done) {
        var result = _.merge({prop1: {we: 1}}, {prop3: 2}, {prop3: 3}, {
            prop1: {
                we: 2,
                i: 1
            }
        }, lib.objectMerger);
        expect(result).to.deep.equal({prop1: {we: 3, i: 1}, prop3: 5});
        done();
    });

    it('mergeObjects', function (done) {
        var result = lib.mergeObjectsInArr(arr);
        expect(result).to.deep.equal(
            {prop1: {three: 3, i: 1}, prop2: 5, prop3: "other"}
        );
        done();
    });

    var str = '“Listen to them, the children of the night. What music they make!”';

    it('prepare string', function (done) {
        var result = lib.prepare(str);
        expect(result).to.deep.equal(
            "listen to them the children of the night what music they make"
        );
        done();
    });

});

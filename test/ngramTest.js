/**
 * Created by syzer on 4/7/2015.
 */
var expect = require('chai').expect;
var lib = require('../index.js')();
var bigramText = lib.bigramText;
var ch1 = lib.ch1;
var ch01 = lib.ch01;

function delNumbers(str) {
    return str.split(',')[0];
}

describe('ngramText', function () {
    it('run on chapter 01', function (done) {
        expect(bigramText(ch01).pretty).to.deep.equal(
            {good: 1}
        );
        done();
    });

    it('should produces same results', function (done) {
        expect(bigramText(ch1).road).to.deep.equal(
            {there: 1, losing: 1, was: 1, is: 1}
        );
        done();
    });

    it('can merge small data sets', function (done) {
        lib.mergeSmall().then(function (data) {
            expect(data.we).to.deep.equal({left: 1, know: 1});
            done();
        });
    });

    //TODO can merge small data sets on remote hosts

    it('can merge large data sets', function (done) {
        this.timeout(5000);
        lib.mergeBig().then(function (data) {
            expect(data.many.questions).to.deep.equal(2);
            done();
        });
    });

    it('can predict for word `i` ', function (done) {
        var result = lib.predict('i');
        expect(result.slice(0, 3).map(delNumbers)).to.deep.equal(['had', 'am', 'could']);
        done();
    });

    it('can predict for word `if` ', function (done) {
        var result = lib.predict('if');
        expect(result.slice(0, 3).map(delNumbers)).to.deep.equal(['he', 'i', 'it']);
        done();
    });

    it('can predict for word `for` ', function (done) {
        var result = lib.predict('for');
        expect(result.slice(0, 3).map(delNumbers)).to.deep.equal(['it', 'the', 'a']);
        done();
    });

    it('can predict for whole dracula', function (done) {
        this.timeout(15000);
        // 29 parts
        lib
            .train('./data/text/dracula/full.txt', '\r\n\r\n\r\nCHAPTER')
            .then(function () {
                var result = lib.predict('i').slice(0, 10).map(delNumbers);
                expect(result).to.include(
                    'had', 'am', 'could', 'was'
                );
                done();
            });
    });

    it('can predict for whole dracula `help`', function (done) {
        var result = lib.predict('help').slice(0, 10).map(delNumbers);
        expect(result).to.include(
            'us', 'me', 'were', 'to'
        );
        done();
    });

    //state with mergeBig
    it('can predict for whole dracula `project`', function (done) {
        var result = lib.predict('van').slice(0, 9).map(delNumbers);
        expect(result).to.include('helsing');
        done();
    });

});

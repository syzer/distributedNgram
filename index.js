/**
 * Created by syzer on 4/7/2015.
 */
var jsSpark = require('js-spark')({workers: 4});
var task = jsSpark.jsSpark;
var q = jsSpark.q;
// alternative version
// var q = require('bluebird');
var _ = require('lodash');
var lib = require('./lib')(_);
_.mixin(lib);
var fs = require('fs');
var DRACULA = './data/text/dracula/';

var ch1 = fs.readFileSync(DRACULA + 'ch1.txt').toString();
var ch2 = fs.readFileSync(DRACULA + 'ch2.txt').toString();
var ch3 = fs.readFileSync(DRACULA + 'ch3.txt').toString();
var ch01 = fs.readFileSync(DRACULA + 'ch01.txt').toString();
var ch02 = fs.readFileSync(DRACULA + 'ch02.txt').toString();

ch01 = _.prepare(ch01).split(' ');
ch02 = _.prepare(ch02).split(' ');

// ch01,ch02 is a collection
var todo = [
    task(ch01)
        .reduce(bigramArray)
        .run(),
    task(ch02)
        // client
        .reduce(bigramArray)
        .run()
];

var text = [ch1, ch2, ch3].map(function (el) {
    return _.prepare(el).split(' ');
});

// cache
var dataBase;

function mergeBig(texts) {
    texts = texts || text;

    return q.all(texts.map(function (el) {
        return task(el)
            .reduce(bigramArray)
            .run()
    })).then(function reducer(data) {
        //return task(data).add('merge').run();
        return _.mergeObjectsInArr(data);
    }).then(function cacheInDb(data) {
        dataBase = data;
        return data;
    });
}

// simples would be return dataBase[word];
// string => array
function predict(word) {
    var needle = dataBase[word];

    if (!needle) {
        return [];
    }

    var total = _.reduce(needle, function (acc, el) {
        return acc + el;
    });

    needle = _.objToSortedArr(needle);

    return _(needle)
        .map(function (el) {
            el[1] = (el[1] / total).toFixed(3);
            return el;
        })
        .map(function (el) {
            return el.join(',');
        })
        .value();
}

function mergeSmall() {
    var task1 = task(ch01)
        .map(function(el){
            return el.toString();
        })
        .reduce(bigramArray)
        .run();

    var task2 = task(ch02)
        .reduce(bigramArray)
        .run();

    return q.all([task1, task2]).then(function (data) {
        return _.merge(data[0], data[1]);
    });
}

module.exports = function () {

    return {
        _: _,
        ch1: text[0],           // this one should not be exposed
        ch01: ch01,
        bigramText: bigramText,
        mergeSmall: mergeSmall, // this should be deleted
        mergeBig: mergeBig,
        train: train,
        predict: predict
    }
};

function bigramText(arr) {
    return arr.reduce(bigramArray);
}

function bigramArray(acc, word, i, arr) {
    if (1 === i) {
        acc = {last: acc, out: {}};
    }
    var out = acc.out;
    var last = acc.last;

    out[last] = out[last] || {};
    out[last][word] = out[last][word] + 1 || 1;

    acc.last = word;
    acc.out = out;

    if (i === arr.length - 1) {
        return acc.out;
    }

    return acc;
}

function train(fileName, splitter) {
    var parts = fs.readFileSync(fileName).toString().split(splitter).map(function (el) {
        return _.prepare(el).split(' ');
    });

    return mergeBig(parts);
}

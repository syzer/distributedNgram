/**
 * Created by syzer on 4/7/2015.
 */
var jsSpark = require('js-spark')({workers: 8});
var task = jsSpark.jsSpark;
var q = jsSpark.q;
var _ = require('lodash');
var lib = require('./lib')(_);
_.mixin(lib);
var fs = require('fs');
var DRACULA = './data/text/dracula/';


// cache
var dataBase;

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

function train(fileName, splitter) {
    var parts = fs.readFileSync(fileName).toString().split(splitter);

    return mergeBig(parts);
}

function mergeBig(texts) {
    return q.all(texts.map(function (el) {
        return task(el)
            .thru(bigramText)
            .run()
    })).then(function reducer(data) {
        //return task(data).add('merge').run();
        return _.mergeObjectsInArr(data);
    }).then(function cacheInDb(data) {
        dataBase = data;
        return data;
    });
}

function bigramText(str) {
    var arr = str
        .replace(/\n/gi, ' ')
        .replace(/\r/gi, ' ')
        .replace(/[^\w\s]+/gi, '')
        .toLowerCase()
        .trim()
        .split(' ');

    var out = {};

    arr.reduce(function bigramReduce(last, word, i, arr) {
        out[last] = out[last] || {};
        out[last][word] = out[last][word] + 1 || 1;

        return word;
    });

    return out;
}


module.exports = function () {

    return {
        bigramText: bigramText,
        train: train,
        predict: predict
    }
};

console.time('train+predict');

module
    .exports()
    .train(DRACULA + 'full.txt', '\r\n\r\n\r\nCHAPTER')
    .then(function () {
        var result = predict('i').slice(0, 10);
        console.log('predictions for word `i`', result);

        console.timeEnd('train+predict');
    });




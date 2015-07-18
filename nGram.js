/**
 * Created by syzer on 4/7/2015.
 */
var jsSpark = require('js-spark')({workers: 2});
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
        return _.mergeObjectsInArr(data);     // uncomment if u want to reduce on this worker
        //return task(data)
        //    .thru(merger)
        //    .run();
    }).then(function cacheInDb(data) {
        dataBase = data;
        return data;
    });
}

function merger(arr) {
    var _ = this;

    function mergeObjectsInArr(arr) {
        return arr.reduce(function (acc, curr) {
            return _.merge(acc, curr, objectMerger);
        });
    }

    function objectMerger(a, b) {
        if (a && b && _.isNumber(a) && _.isNumber(b)) {
            return a + b;
        }
        if (_.isArray(a)) {
            return a.concat(b);
        }
    }

    return mergeObjectsInArr(arr);
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

function displayPrediction(result, i, word) {
    console.log('\n\nPredictions for word: ' + (words[i] || word));
    console.log(result);
}

module.exports = function () {

    return {
        bigramText: bigramText,
        train: train,
        predict: predict
    }
};

function promptUserPredicitons(predictions) {
    var prompt = require('prompt');
    prompt.start();
    prompt.get(['word'], function (err, res) {
        displayPrediction(predict(res.word).slice(0, 10), null, res.word);
        return predictions;
    });
}

// van is the word
var words = ['i', 'van', 'helsing'];

console.time('train');

module
    .exports()
    .train(DRACULA + 'full.txt', '\r\n\r\n\r\nCHAPTER')
    .then(function () {
        console.timeEnd('train');
        return words.map(function (word) {
            return predict(word).slice(0, 10);
        });
    })
    .then(function displayPredictions(predictions) {
        predictions.map(displayPrediction);
        return predictions;
    })
    .then(promptUserPredicitons);




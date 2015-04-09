/**
 * Created by syzer on 4/8/2015.
 */
module.exports = function (_) {
    'use strict';

    return {
        objectMerger: objectMerger,
        mergeObjectsInArr: mergeObjectsInArr,
        objToSortedArr: objToSortedArr,
        prepare: prepare
    };

    function prepare(str) {
        return str
            .replace(/\n/gi, ' ')
            .replace(/\r/gi, ' ')
            .replace(/[^\w\s]+/gi, '')
            .toLowerCase()
            .trim();
    }

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

    function objToSortedArr(obj) {
        var sortable = [];

        for (var vehicle in obj) {
            sortable.push([vehicle, obj[vehicle]])
        }

        // sort by values and if same sort by keys
        sortable.sort(function (a, b) {
            return b[1] - a[1] || a[0] > b[0]
        });
        return sortable;
    }

};

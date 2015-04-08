HOWTO
=====

installation
------------

        npm init
        npm i --save js-spark bluebird
        npm i --save-dev mocha chai

testing basic distributed task
------------------------------

```js
var jsSpark = require('js-spark')({workers: 4});
var task = jsSpark.jsSpark;
var q = jsSpark.q;

task([20, 30, 40, 50])
    // this is executed on client side
    .map(function addOne(num) {
        return num + 1;
    })
    .reduce(function sumUp(sum, num) {
        return sum + num;
    })
    .run()
    .then(function(data) {
        // this is executed on back on server
        console.log(data);
    })
```


tests
-----

        npm test


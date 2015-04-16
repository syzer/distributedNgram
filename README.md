WAT
===

Simply put predict next word user will write.

HOWTO
=====

installation
------------

        git clone git@github.com:syzer/distributedNgram.git && cd $_
        npm install
        npm install --save-dev


The file nGram.js offers more compact version of code:

        node nGram



testing basic distributed task
------------------------------

```js
var jsSpark = require('js-spark')({workers: 16});
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
        console.log('i finished calculating', data);
    })
```


tests
-----

        npm test



Tasks
=====
clone [https://github.com/syzer/distributedNgram.git](https://github.com/syzer/distributedNgram.git)


./index.js
----------
load:

1. dracula

2. lodash

3. load helpers

(gist)


// helpers
./lib/index.js
--------------
make function **prepare()**

```js
// remove special characters
function prepare(str){}
prepare('“Listen to them, the children of the night. What music they make!”')
//=>"listen to them the children of the night what music they make"
```

(gist)


./index.js
--------------
make **bigramText()**

```js
bigramText("to listen to them the children of the night what music they make");
//=>{to: {listen: 1, them:1} , listen:{to:1}, the:{children:1}}...
```








```js
function bigramText(str) {
    return arr.reduce(bigramArray);
}
```
(gist)



./index.js
----------
**function mergeSmall()**

1. create 2 tasks ch01, and ch02

2. use tasks to bigram those chapters

3. reduce response with _.merge

(gist)


./index.js
----------
**function mergeBig(texts)**

1. load [ch1, ch2, ch3] or texts

2. make distinct tasks to bigram this text

3. reduce with _.mergeObjectsInArr

4. cache result

5. return result

(gist)


./index.js
----------
**function predict(word)**
1. load appropriate key/word from cache

2. calc total hits

3. sort all hits in order,

may use helper function **objToSortedArr(obj)**

4. calc frequency/probability of next word

(gist)



./index.js
----------
**function train(fileName, splitter)**

1. load file

2. prepare

3. use splitter(string) to create separate tasks

4. calculate tasks on clients using mergeBig()







TODO
====
[ ] git checkout
[ ] js-spark adventure


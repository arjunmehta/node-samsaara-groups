#!/bin/bash
cp ./node_modules/mocha/mocha.css ./test &&
cp ./node_modules/mocha/mocha.js ./test &&
cp ./node_modules/chai/chai.js ./test &&
(node test/test.js & sleep 3;
./node_modules/mocha-phantomjs/bin/mocha-phantomjs --local-storage-path=./ http://localhost:9999/testGroupA.html &
./node_modules/mocha-phantomjs/bin/mocha-phantomjs --local-storage-path=./ http://localhost:9999/testGroupA.html &
./node_modules/mocha-phantomjs/bin/mocha-phantomjs --local-storage-path=./ http://localhost:9999/testGroupA.html &
./node_modules/mocha-phantomjs/bin/mocha-phantomjs --local-storage-path=./ http://localhost:9999/testGroupA.html &
./node_modules/mocha-phantomjs/bin/mocha-phantomjs --local-storage-path=./ http://localhost:9999/testGroupB.html &
./node_modules/mocha-phantomjs/bin/mocha-phantomjs --local-storage-path=./ http://localhost:9999/testGroupB.html &
./node_modules/mocha-phantomjs/bin/mocha-phantomjs --local-storage-path=./ http://localhost:9999/testGroupB.html &
./node_modules/mocha-phantomjs/bin/mocha-phantomjs --local-storage-path=./ http://localhost:9999/testGroupB.html &
./node_modules/mocha-phantomjs/bin/mocha-phantomjs --local-storage-path=./ http://localhost:9999/testGroupB.html) &&
rm ./test/mocha* &&
rm ./test/chai*
exit 0
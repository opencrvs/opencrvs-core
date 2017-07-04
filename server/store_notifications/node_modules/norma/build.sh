./node_modules/.bin/pegjs norma-parser.pegjs
./node_modules/.bin/uglifyjs norma.js -c "evaluate=false" --comments "/ Copyright .*/" -m --source-map norma-min.map -o norma-min.js
./node_modules/.bin/jshint norma.js
./node_modules/.bin/docco norma.js -o doc
cp -r doc/* ../gh-pages/norma/doc

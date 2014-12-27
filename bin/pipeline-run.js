#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2)),
  turf = require('turf'),
  crypto = require('crypto'),
  fs = require('fs');

var recipeName = argv._[0];
var filename = argv._[1];
if (!recipeName) throw new Error('input.json required');
if (!filename) throw new Error('input.json required');

sha1sum(filename, function(err, id) {
  console.log('task', id);
  var recipe = JSON.parse(fs.readFileSync(recipeName));
  var input = JSON.parse(fs.readFileSync(filename));

  var output = recipe.reduce(function(geojson, instruction, i) {
    console.error('step %s: running %s', i, instruction);
    var result = turf[instruction](geojson);
    fs.writeFileSync(id + '-' + instruction);
    return result;
  }, input);
  console.log(output);
});

function sha1sum(filename, callback) {
  var shasum = crypto.createHash('sha1');
  var s = fs.ReadStream(filename);
  s.on('data', function(d) { shasum.update(d); });
  s.on('end', function() {
    var d = shasum.digest('hex');
    callback(null, d);
  });
}

#!/usr/local/env node

var argv = require('minimist')(process.argv.slice(2)),
  turf = require('turf'),
  fs = require('fs');

if (!argv._[0]) throw new Error('input.json required');

var recipe = JSON.parse(fs.readFileSync(argv._[0]));
var input = JSON.parse(fs.readFileSync(argv._[1]));

var output = recipe.reduce(function(geojson, instruction) {
  console.error('running %s', instruction);
  return turf[instruction](geojson);
}, input);

console.log(output);

var turf = require('turf');
var fs = require('fs');
var step0 = JSON.parse(fs.readFileSync(process.argv[2]));
var step1 = turf.extent(step0);
console.log(step1);

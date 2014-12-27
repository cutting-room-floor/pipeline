#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2)),
  escodegen = require('escodegen'),
  fs = require('fs');

if (!argv._[0]) throw new Error('input.json required');

var input = JSON.parse(fs.readFileSync(argv._[0]));

var bootstrap = (function() {
var turf = require('turf');
var fs = require('fs');
var step0 = JSON.parse(fs.readFileSync(process.argv[2]));
}).toString().split(/\n/);
bootstrap.pop();
bootstrap.shift();
bootstrap = bootstrap.join('\n') + '\n';

console.log(
  bootstrap +
  escodegen.generate({
    "type": "Program",
    "body": input.map(runStep).concat([end(input.length)])
}));

function runStep(member, i) {
  var input = "step" + i;
  var output = "step" + (i + 1);
  return {
    "type": "VariableDeclaration",
    "declarations": [
      {
      "type": "VariableDeclarator",
      "id": {
        "type": "Identifier",
        "name": output
      },
      "init": {
        "type": "CallExpression",
        "callee": {
          "type": "MemberExpression",
          "computed": false,
          "object": {
            "type": "Identifier",
            "name": "turf"
          },
          "property": {
            "type": "Identifier",
            "name": member
          }
        },
        "arguments": [{
          "type": "Identifier",
          "name": input
        }]
      }
    }
    ],
    "kind": "var"
  };
}

function end(i) {
  return {
    "type": "Program",
    "body": [{
      "type": "ExpressionStatement",
      "expression": {
        "type": "CallExpression",
        "callee": {
          "type": "MemberExpression",
          "computed": false,
          "object": {
            "type": "Identifier",
            "name": "console"
          },
          "property": {
            "type": "Identifier",
            "name": "log"
          }
        },
        "arguments": [{
          "type": "Identifier",
          "name": "step" + i
        }]
      }
    }]
  };
}

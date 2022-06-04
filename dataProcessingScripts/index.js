const clone = require('./clone.js');
const knife = require('./knife.js');
const json = require('./json.js');
const combine = require('./combine.js');
const aggregate = require('./aggregate.js');

//console.log(clone);
//Clone the repositories
console.log("Clonning...");
clone();
//Convert to kniveSV files
console.log("Knifing...");
knife();
//Convert to JSON files
console.log("Convertng to json...");
json();
//Combine the output file
console.log("Combining thr output file...");
combine();
//Aggregate by week
aggregate();
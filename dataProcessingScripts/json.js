let fs = require("fs")
let {exec} = require("child_process")
const depends = require("./depends"); 

let json  = () => {
	  depends.forEach(repo => {
	  let txt = fs.readFileSync(`data/${repo}.001.ðªsv`).toString()
	  lines = txt.split("â")
	  commits = lines.slice(1).map(line => {
		let l = line.split("ðª");
		return {
		  //hash: l[0],
		  date: l[1],
		  author: l[2],
		  //subject: l[3],
		  //body: l[4]
		};
	  })
	  fs.writeFileSync(`data/${repo}.001.json`, JSON.stringify(commits))
	})
}

module.exports = json;

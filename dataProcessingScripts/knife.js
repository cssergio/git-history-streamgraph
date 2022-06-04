const {exec} = require("child_process")
const depends = require("./depends");

const knife = () => {
	exec('mkdir data');
	depends.forEach(repo => {
	  let command = `git log --pretty=format:"☕%h🔪%ad🔪%an🔪%s🔪%b" --date="iso" --no-merges --compact-summary > ../../data/${repo}.001.🔪sv`
	  //exec(`cd repositories/${repo}`); 
	  exec(command, {cwd: `./repositories/${repo}`}, (error, stdout, stderr) => {
		// TODO: handle errors.
		if(error) console.log(error);
		//console.log(command);
	  })
	})
};
module.exports = knife;
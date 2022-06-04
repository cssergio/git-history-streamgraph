const {execSync} = require("child_process")
const depends = require("./depends");

const knife = () => {
	execSync('mkdir data');
	depends.forEach(repo => {
	  let command = `git log --pretty=format:"☕%h🔪%ad🔪%an🔪%s🔪%b" --date="iso" --no-merges --compact-summary > ../../data/${repo}.001.🔪sv`
	  //exec(`cd repositories/${repo}`); 
	  execSync(command, {cwd: `./repositories/${repo}`}, (error, stdout, stderr) => {
		// TODO: handle errors.
		if(error) console.log(error);
		//console.log(command);
	  })
	})
};
module.exports = knife;
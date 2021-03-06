const fs = require("fs")
const d3 = require('d3')
const {
  timeParse,
  timeFormat,
  utcWeek,
  utcWeeks,
  group,
  stack,
  extent,
  stackOffsetWiggle,
  stackOrderAppearance,
} = d3;

const parseDate = timeParse('%Y-%m-%d');
const formatDate = timeFormat('%Y-%m-%d');

const layer = (d) => d.repo;

const aggregate = () => {
	//Load all commits
	const dataString = fs.readFileSync('data/all-d3-commits.json').toString();
	const data = JSON.parse(dataString);
	data.forEach((d) => {
		//console.log(d.date.split(' ')[0]);
		d.date = utcWeek.floor(parseDate(d.date.split(' ')[0]));
	});

	const groupedData = group(data,(d) => d.date,layer);

	const layerGroupedData = group(data, layer);

	const layers = Array.from(layerGroupedData.keys());

	const [start, stop] = extent(data, (d) => d.date);
	const allWeeks = utcWeeks(start, stop);

	const dataBylayer = new Map();

	const aggregateData = {
		dates: allWeeks.map(d => formatDate(d)),
		repositories: {}
	};
	for (const layer of layers) {
		const layerData = allWeeks.map((date) => {
			const value = groupedData.get(date);
			const commits = value ? value.get(layer) : null;
			const commitCount = commits ? commits.length : 0;
			return commitCount;
		});
		//console.log(layerData);
		aggregateData.repositories[layer] = layerData;
	}
	fs.writeFileSync('../docs/aggregatedData.json', JSON.stringify(aggregateData));
};

module.exports = aggregate;
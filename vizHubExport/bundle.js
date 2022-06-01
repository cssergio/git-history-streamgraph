(function (d3, d3AreaLabel, arrayBlur) {
  'use strict';

  const blurRadius = 15;

  const parseDate = d3.timeParse('%Y-%m-%d');

  const layer = (d) => d.repo;

  const transformData = (data) => {
    //data = data.filter(d => d.repo !== 'd3');
    data.forEach((d) => {
      d.date = d3.utcWeek.floor(
        parseDate(d.date.split(' ')[0])
      );
    });

    // Aggregate by week and repository.
    const groupedData = d3.group(
      data,
      (d) => d.date,
      layer
    );

    const layerGroupedData = d3.group(data, layer);

    const layers = Array.from(
      layerGroupedData.keys()
    );

    const [start, stop] = d3.extent(
      data,
      (d) => d.date
    );
    const allWeeks = d3.utcWeeks(start, stop);

    const dataBylayer = new Map();

    for (const layer of layers) {
      const layerData = allWeeks.map((date) => {
        const value = groupedData.get(date);
        const commits = value
          ? value.get(layer)
          : null;
        const commitCount = commits
          ? commits.length
          : 0;
        return commitCount;
      });

      // Apply smoothing
      const smoothedLayerData = arrayBlur.blur().radius(
        blurRadius
      )(layerData);

      dataBylayer.set(layer, smoothedLayerData);
    }

    const transformedData = [];
    allWeeks.forEach((date, i) => {
      const row = { date };
      for (let layer of layers) {
        row[layer] = dataBylayer.get(layer)[i];
      }
      transformedData.push(row);
    });

    const stackedData = d3.stack()
      .offset(d3.stackOffsetWiggle)
      .order(d3.stackOrderAppearance)
      .keys(layers)(transformedData);

    return { data, stackedData };
  };

  const dataURL =
    'https://gist.githubusercontent.com/curran/18287ef2c4b64ffba32000aad47c292b/raw/eb2dd48d383f09a70b23dc35c3e8eb7b6c7c31ad/all-d3-commits.json';
  const width = window.innerWidth;
  const height = window.innerHeight;

  const margin = {
    top: 20,
    right: 0,
    bottom: 20,
    left: 0,
  };
  const ticks = 20;

  const innerWidth =
    width - margin.left - margin.right;
  const innerHeight =
    height - margin.top - margin.bottom;

  const xValue = (d) => d.date;

  const render = ({ data, stackedData }) => {
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, xValue))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(stackedData, (d) =>
          d3.min(d, (d) => d[0])
        ),
        d3.max(stackedData, (d) =>
          d3.max(d, (d) => d[1])
        ),
      ])
      .range([innerHeight, 0]);

    const areaGenerator = d3.area()
      .x((d) => xScale(d.data.date))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]));

    const svg = d3.select('body')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left},${margin.top})`
      );

    const random = d3.randomNormal.source(
      d3.randomLcg(0.5)
    )(30, 10);

    const colorScale = d3.scaleOrdinal().range(
      stackedData.map((country, i) => {
        const t = i / stackedData.length;
        return d3.hcl(t * 360, 50, random());
      })
    );

    g.append('g').call(
      d3.axisTop(xScale)
        .tickSize(-innerHeight)
        .tickPadding(6)
        .ticks(ticks)
    );
    g.append('g')
      .attr(
        'transform',
        `translate(0, ${innerHeight})`
      )
      .call(
        d3.axisBottom(xScale)
          .tickSize(0)
          .tickPadding(5)
          .ticks(ticks)
      )
      .selectAll('line')
      .remove();

    // Add a black "envelope" as a backdrop behind the layers,
    // so that we don't get undesirable artifacts where the
    // tick lines are slightly visible in the cracks between layers.
    stackedData.sort((a, b) =>
      d3.ascending(a.index, b.index)
    );
    const first = stackedData[0];
    const last =
      stackedData[stackedData.length - 1];
    const outlinePadding = 0.5;
    const envelope = first.map((d, i) =>
      Object.assign(
        [
          d[0] - outlinePadding,
          last[i][1] + outlinePadding,
        ],
        { data: d.data }
      )
    );
    g.append('path').attr(
      'd',
      areaGenerator(envelope)
    );

    g.append('g')
      .selectAll('path')
      .data(stackedData)
      .enter()
      .append('a')
      .attr(
        'href',
        (d) => `https://github.com/d3/${d.key}`
      )
      .attr('target', '_blank')
      .append('path')
      .attr('class', 'area')
      .attr('d', areaGenerator)
      .attr('fill', (d) => colorScale(d.key))
      .append('title')
      .text((d) => d.key);

    const labels = g
      .append('g')
      .selectAll('text')
      .data(stackedData);

    labels
      .enter()
      .append('text')
      .attr('class', 'area-label')
      .merge(labels)
      .text((d) => d.key)
      .attr('transform', d3AreaLabel.areaLabel(areaGenerator));
  };

  // Load the data.
  d3.json(dataURL).then((data) => {
    render(transformData(data));
  });

}(d3, d3, d3));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbInRyYW5zZm9ybURhdGEuanMiLCJpbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICB0aW1lUGFyc2UsXG4gIHV0Y1dlZWssXG4gIHV0Y1dlZWtzLFxuICBncm91cCxcbiAgc3RhY2ssXG4gIGV4dGVudCxcbiAgc3RhY2tPZmZzZXRXaWdnbGUsXG4gIHN0YWNrT3JkZXJBcHBlYXJhbmNlLFxufSBmcm9tICdkMyc7XG5pbXBvcnQgeyBibHVyIH0gZnJvbSAnYXJyYXktYmx1cic7XG5cbmNvbnN0IGJsdXJSYWRpdXMgPSAxNTtcblxuY29uc3QgcGFyc2VEYXRlID0gdGltZVBhcnNlKCclWS0lbS0lZCcpO1xuXG5jb25zdCBsYXllciA9IChkKSA9PiBkLnJlcG87XG5cbmV4cG9ydCBjb25zdCB0cmFuc2Zvcm1EYXRhID0gKGRhdGEpID0+IHtcbiAgLy9kYXRhID0gZGF0YS5maWx0ZXIoZCA9PiBkLnJlcG8gIT09ICdkMycpO1xuICBkYXRhLmZvckVhY2goKGQpID0+IHtcbiAgICBkLmRhdGUgPSB1dGNXZWVrLmZsb29yKFxuICAgICAgcGFyc2VEYXRlKGQuZGF0ZS5zcGxpdCgnICcpWzBdKVxuICAgICk7XG4gIH0pO1xuXG4gIC8vIEFnZ3JlZ2F0ZSBieSB3ZWVrIGFuZCByZXBvc2l0b3J5LlxuICBjb25zdCBncm91cGVkRGF0YSA9IGdyb3VwKFxuICAgIGRhdGEsXG4gICAgKGQpID0+IGQuZGF0ZSxcbiAgICBsYXllclxuICApO1xuXG4gIGNvbnN0IGxheWVyR3JvdXBlZERhdGEgPSBncm91cChkYXRhLCBsYXllcik7XG5cbiAgY29uc3QgbGF5ZXJzID0gQXJyYXkuZnJvbShcbiAgICBsYXllckdyb3VwZWREYXRhLmtleXMoKVxuICApO1xuXG4gIGNvbnN0IFtzdGFydCwgc3RvcF0gPSBleHRlbnQoXG4gICAgZGF0YSxcbiAgICAoZCkgPT4gZC5kYXRlXG4gICk7XG4gIGNvbnN0IGFsbFdlZWtzID0gdXRjV2Vla3Moc3RhcnQsIHN0b3ApO1xuXG4gIGNvbnN0IGRhdGFCeWxheWVyID0gbmV3IE1hcCgpO1xuXG4gIGZvciAoY29uc3QgbGF5ZXIgb2YgbGF5ZXJzKSB7XG4gICAgY29uc3QgbGF5ZXJEYXRhID0gYWxsV2Vla3MubWFwKChkYXRlKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGdyb3VwZWREYXRhLmdldChkYXRlKTtcbiAgICAgIGNvbnN0IGNvbW1pdHMgPSB2YWx1ZVxuICAgICAgICA/IHZhbHVlLmdldChsYXllcilcbiAgICAgICAgOiBudWxsO1xuICAgICAgY29uc3QgY29tbWl0Q291bnQgPSBjb21taXRzXG4gICAgICAgID8gY29tbWl0cy5sZW5ndGhcbiAgICAgICAgOiAwO1xuICAgICAgcmV0dXJuIGNvbW1pdENvdW50O1xuICAgIH0pO1xuXG4gICAgLy8gQXBwbHkgc21vb3RoaW5nXG4gICAgY29uc3Qgc21vb3RoZWRMYXllckRhdGEgPSBibHVyKCkucmFkaXVzKFxuICAgICAgYmx1clJhZGl1c1xuICAgICkobGF5ZXJEYXRhKTtcblxuICAgIGRhdGFCeWxheWVyLnNldChsYXllciwgc21vb3RoZWRMYXllckRhdGEpO1xuICB9XG5cbiAgY29uc3QgdHJhbnNmb3JtZWREYXRhID0gW107XG4gIGFsbFdlZWtzLmZvckVhY2goKGRhdGUsIGkpID0+IHtcbiAgICBjb25zdCByb3cgPSB7IGRhdGUgfTtcbiAgICBmb3IgKGxldCBsYXllciBvZiBsYXllcnMpIHtcbiAgICAgIHJvd1tsYXllcl0gPSBkYXRhQnlsYXllci5nZXQobGF5ZXIpW2ldO1xuICAgIH1cbiAgICB0cmFuc2Zvcm1lZERhdGEucHVzaChyb3cpO1xuICB9KTtcblxuICBjb25zdCBzdGFja2VkRGF0YSA9IHN0YWNrKClcbiAgICAub2Zmc2V0KHN0YWNrT2Zmc2V0V2lnZ2xlKVxuICAgIC5vcmRlcihzdGFja09yZGVyQXBwZWFyYW5jZSlcbiAgICAua2V5cyhsYXllcnMpKHRyYW5zZm9ybWVkRGF0YSk7XG5cbiAgcmV0dXJuIHsgZGF0YSwgc3RhY2tlZERhdGEgfTtcbn07XG4iLCJpbXBvcnQge1xuICBqc29uLFxuICBzY2FsZVRpbWUsXG4gIGV4dGVudCxcbiAgbWF4LFxuICBtaW4sXG4gIHNjYWxlTGluZWFyLFxuICBhcmVhLFxuICBzZWxlY3QsXG4gIHNjYWxlT3JkaW5hbCxcbiAgaGNsLFxuICByYW5kb21Ob3JtYWwsXG4gIHJhbmRvbUxjZyxcbiAgYXhpc1RvcCxcbiAgYXhpc0JvdHRvbSxcbiAgYXNjZW5kaW5nLFxufSBmcm9tICdkMyc7XG5pbXBvcnQgeyBhcmVhTGFiZWwgfSBmcm9tICdkMy1hcmVhLWxhYmVsJztcbmltcG9ydCB7IHRyYW5zZm9ybURhdGEgfSBmcm9tICcuL3RyYW5zZm9ybURhdGEnO1xuXG5jb25zdCBkYXRhVVJMID1cbiAgJ2h0dHBzOi8vZ2lzdC5naXRodWJ1c2VyY29udGVudC5jb20vY3VycmFuLzE4Mjg3ZWYyYzRiNjRmZmJhMzIwMDBhYWQ0N2MyOTJiL3Jhdy9lYjJkZDQ4ZDM4M2YwOWE3MGIyM2RjMzVjM2U4ZWI3YjZjN2MzMWFkL2FsbC1kMy1jb21taXRzLmpzb24nO1xuY29uc3Qgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbmNvbnN0IGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuY29uc3QgbWFyZ2luID0ge1xuICB0b3A6IDIwLFxuICByaWdodDogMCxcbiAgYm90dG9tOiAyMCxcbiAgbGVmdDogMCxcbn07XG5jb25zdCB0aWNrcyA9IDIwO1xuXG5jb25zdCBpbm5lcldpZHRoID1cbiAgd2lkdGggLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodDtcbmNvbnN0IGlubmVySGVpZ2h0ID1cbiAgaGVpZ2h0IC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XG5cbmNvbnN0IHhWYWx1ZSA9IChkKSA9PiBkLmRhdGU7XG5cbmNvbnN0IHJlbmRlciA9ICh7IGRhdGEsIHN0YWNrZWREYXRhIH0pID0+IHtcbiAgY29uc3QgeFNjYWxlID0gc2NhbGVUaW1lKClcbiAgICAuZG9tYWluKGV4dGVudChkYXRhLCB4VmFsdWUpKVxuICAgIC5yYW5nZShbMCwgaW5uZXJXaWR0aF0pO1xuXG4gIGNvbnN0IHlTY2FsZSA9IHNjYWxlTGluZWFyKClcbiAgICAuZG9tYWluKFtcbiAgICAgIG1pbihzdGFja2VkRGF0YSwgKGQpID0+XG4gICAgICAgIG1pbihkLCAoZCkgPT4gZFswXSlcbiAgICAgICksXG4gICAgICBtYXgoc3RhY2tlZERhdGEsIChkKSA9PlxuICAgICAgICBtYXgoZCwgKGQpID0+IGRbMV0pXG4gICAgICApLFxuICAgIF0pXG4gICAgLnJhbmdlKFtpbm5lckhlaWdodCwgMF0pO1xuXG4gIGNvbnN0IGFyZWFHZW5lcmF0b3IgPSBhcmVhKClcbiAgICAueCgoZCkgPT4geFNjYWxlKGQuZGF0YS5kYXRlKSlcbiAgICAueTAoKGQpID0+IHlTY2FsZShkWzBdKSlcbiAgICAueTEoKGQpID0+IHlTY2FsZShkWzFdKSk7XG5cbiAgY29uc3Qgc3ZnID0gc2VsZWN0KCdib2R5JylcbiAgICAuYXBwZW5kKCdzdmcnKVxuICAgIC5hdHRyKCd3aWR0aCcsIHdpZHRoKVxuICAgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpO1xuXG4gIGNvbnN0IGcgPSBzdmdcbiAgICAuYXBwZW5kKCdnJylcbiAgICAuYXR0cihcbiAgICAgICd0cmFuc2Zvcm0nLFxuICAgICAgYHRyYW5zbGF0ZSgke21hcmdpbi5sZWZ0fSwke21hcmdpbi50b3B9KWBcbiAgICApO1xuXG4gIGNvbnN0IHJhbmRvbSA9IHJhbmRvbU5vcm1hbC5zb3VyY2UoXG4gICAgcmFuZG9tTGNnKDAuNSlcbiAgKSgzMCwgMTApO1xuXG4gIGNvbnN0IGNvbG9yU2NhbGUgPSBzY2FsZU9yZGluYWwoKS5yYW5nZShcbiAgICBzdGFja2VkRGF0YS5tYXAoKGNvdW50cnksIGkpID0+IHtcbiAgICAgIGNvbnN0IHQgPSBpIC8gc3RhY2tlZERhdGEubGVuZ3RoO1xuICAgICAgcmV0dXJuIGhjbCh0ICogMzYwLCA1MCwgcmFuZG9tKCkpO1xuICAgIH0pXG4gICk7XG5cbiAgZy5hcHBlbmQoJ2cnKS5jYWxsKFxuICAgIGF4aXNUb3AoeFNjYWxlKVxuICAgICAgLnRpY2tTaXplKC1pbm5lckhlaWdodClcbiAgICAgIC50aWNrUGFkZGluZyg2KVxuICAgICAgLnRpY2tzKHRpY2tzKVxuICApO1xuICBnLmFwcGVuZCgnZycpXG4gICAgLmF0dHIoXG4gICAgICAndHJhbnNmb3JtJyxcbiAgICAgIGB0cmFuc2xhdGUoMCwgJHtpbm5lckhlaWdodH0pYFxuICAgIClcbiAgICAuY2FsbChcbiAgICAgIGF4aXNCb3R0b20oeFNjYWxlKVxuICAgICAgICAudGlja1NpemUoMClcbiAgICAgICAgLnRpY2tQYWRkaW5nKDUpXG4gICAgICAgIC50aWNrcyh0aWNrcylcbiAgICApXG4gICAgLnNlbGVjdEFsbCgnbGluZScpXG4gICAgLnJlbW92ZSgpO1xuXG4gIC8vIEFkZCBhIGJsYWNrIFwiZW52ZWxvcGVcIiBhcyBhIGJhY2tkcm9wIGJlaGluZCB0aGUgbGF5ZXJzLFxuICAvLyBzbyB0aGF0IHdlIGRvbid0IGdldCB1bmRlc2lyYWJsZSBhcnRpZmFjdHMgd2hlcmUgdGhlXG4gIC8vIHRpY2sgbGluZXMgYXJlIHNsaWdodGx5IHZpc2libGUgaW4gdGhlIGNyYWNrcyBiZXR3ZWVuIGxheWVycy5cbiAgc3RhY2tlZERhdGEuc29ydCgoYSwgYikgPT5cbiAgICBhc2NlbmRpbmcoYS5pbmRleCwgYi5pbmRleClcbiAgKTtcbiAgY29uc3QgZmlyc3QgPSBzdGFja2VkRGF0YVswXTtcbiAgY29uc3QgbGFzdCA9XG4gICAgc3RhY2tlZERhdGFbc3RhY2tlZERhdGEubGVuZ3RoIC0gMV07XG4gIGNvbnN0IG91dGxpbmVQYWRkaW5nID0gMC41O1xuICBjb25zdCBlbnZlbG9wZSA9IGZpcnN0Lm1hcCgoZCwgaSkgPT5cbiAgICBPYmplY3QuYXNzaWduKFxuICAgICAgW1xuICAgICAgICBkWzBdIC0gb3V0bGluZVBhZGRpbmcsXG4gICAgICAgIGxhc3RbaV1bMV0gKyBvdXRsaW5lUGFkZGluZyxcbiAgICAgIF0sXG4gICAgICB7IGRhdGE6IGQuZGF0YSB9XG4gICAgKVxuICApO1xuICBnLmFwcGVuZCgncGF0aCcpLmF0dHIoXG4gICAgJ2QnLFxuICAgIGFyZWFHZW5lcmF0b3IoZW52ZWxvcGUpXG4gICk7XG5cbiAgZy5hcHBlbmQoJ2cnKVxuICAgIC5zZWxlY3RBbGwoJ3BhdGgnKVxuICAgIC5kYXRhKHN0YWNrZWREYXRhKVxuICAgIC5lbnRlcigpXG4gICAgLmFwcGVuZCgnYScpXG4gICAgLmF0dHIoXG4gICAgICAnaHJlZicsXG4gICAgICAoZCkgPT4gYGh0dHBzOi8vZ2l0aHViLmNvbS9kMy8ke2Qua2V5fWBcbiAgICApXG4gICAgLmF0dHIoJ3RhcmdldCcsICdfYmxhbmsnKVxuICAgIC5hcHBlbmQoJ3BhdGgnKVxuICAgIC5hdHRyKCdjbGFzcycsICdhcmVhJylcbiAgICAuYXR0cignZCcsIGFyZWFHZW5lcmF0b3IpXG4gICAgLmF0dHIoJ2ZpbGwnLCAoZCkgPT4gY29sb3JTY2FsZShkLmtleSkpXG4gICAgLmFwcGVuZCgndGl0bGUnKVxuICAgIC50ZXh0KChkKSA9PiBkLmtleSk7XG5cbiAgY29uc3QgbGFiZWxzID0gZ1xuICAgIC5hcHBlbmQoJ2cnKVxuICAgIC5zZWxlY3RBbGwoJ3RleHQnKVxuICAgIC5kYXRhKHN0YWNrZWREYXRhKTtcblxuICBsYWJlbHNcbiAgICAuZW50ZXIoKVxuICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgIC5hdHRyKCdjbGFzcycsICdhcmVhLWxhYmVsJylcbiAgICAubWVyZ2UobGFiZWxzKVxuICAgIC50ZXh0KChkKSA9PiBkLmtleSlcbiAgICAuYXR0cigndHJhbnNmb3JtJywgYXJlYUxhYmVsKGFyZWFHZW5lcmF0b3IpKTtcbn07XG5cbi8vIExvYWQgdGhlIGRhdGEuXG5qc29uKGRhdGFVUkwpLnRoZW4oKGRhdGEpID0+IHtcbiAgcmVuZGVyKHRyYW5zZm9ybURhdGEoZGF0YSkpO1xufSk7XG4iXSwibmFtZXMiOlsidGltZVBhcnNlIiwidXRjV2VlayIsImdyb3VwIiwiZXh0ZW50IiwidXRjV2Vla3MiLCJibHVyIiwic3RhY2siLCJzdGFja09mZnNldFdpZ2dsZSIsInN0YWNrT3JkZXJBcHBlYXJhbmNlIiwic2NhbGVUaW1lIiwic2NhbGVMaW5lYXIiLCJtaW4iLCJtYXgiLCJhcmVhIiwic2VsZWN0IiwicmFuZG9tTm9ybWFsIiwicmFuZG9tTGNnIiwic2NhbGVPcmRpbmFsIiwiaGNsIiwiYXhpc1RvcCIsImF4aXNCb3R0b20iLCJhc2NlbmRpbmciLCJhcmVhTGFiZWwiLCJqc29uIl0sIm1hcHBpbmdzIjoiOzs7RUFZQSxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDdEI7RUFDQSxNQUFNLFNBQVMsR0FBR0EsWUFBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3hDO0VBQ0EsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQztBQUM1QjtFQUNPLE1BQU0sYUFBYSxHQUFHLENBQUMsSUFBSSxLQUFLO0VBQ3ZDO0VBQ0EsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLO0VBQ3RCLElBQUksQ0FBQyxDQUFDLElBQUksR0FBR0MsVUFBTyxDQUFDLEtBQUs7RUFDMUIsTUFBTSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDckMsS0FBSyxDQUFDO0VBQ04sR0FBRyxDQUFDLENBQUM7QUFDTDtFQUNBO0VBQ0EsRUFBRSxNQUFNLFdBQVcsR0FBR0MsUUFBSztFQUMzQixJQUFJLElBQUk7RUFDUixJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJO0VBQ2pCLElBQUksS0FBSztFQUNULEdBQUcsQ0FBQztBQUNKO0VBQ0EsRUFBRSxNQUFNLGdCQUFnQixHQUFHQSxRQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzlDO0VBQ0EsRUFBRSxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMs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
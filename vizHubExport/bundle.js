!function(t,a,e){"use strict";const r=t.timeParse("%Y-%m-%d"),n=t=>t.repo,s=window.innerWidth,d=window.innerHeight,c=20,o=0,l=s-o-0,i=d-c-20,p=t=>t.date;t.json("https://gist.githubusercontent.com/curran/18287ef2c4b64ffba32000aad47c292b/raw/eb2dd48d383f09a70b23dc35c3e8eb7b6c7c31ad/all-d3-commits.json").then((g=>{(({data:e,stackedData:r})=>{const n=t.scaleTime().domain(t.extent(e,p)).range([0,l]),g=t.scaleLinear().domain([t.min(r,(a=>t.min(a,(t=>t[0])))),t.max(r,(a=>t.max(a,(t=>t[1]))))]).range([i,0]),m=t.area().x((t=>n(t.data.date))).y0((t=>g(t[0]))).y1((t=>g(t[1]))),f=t.select("body").append("svg").attr("width",s).attr("height",d).append("g").attr("transform",`translate(${o},${c})`),h=t.randomNormal.source(t.randomLcg(.5))(30,10),k=t.scaleOrdinal().range(r.map(((a,e)=>{const n=e/r.length;return t.hcl(360*n,50,h())})));f.append("g").call(t.axisTop(n).tickSize(-i).tickPadding(6).ticks(20)),f.append("g").attr("transform",`translate(0, ${i})`).call(t.axisBottom(n).tickSize(0).tickPadding(5).ticks(20)).selectAll("line").remove(),r.sort(((a,e)=>t.ascending(a.index,e.index)));const u=r[0],b=r[r.length-1],x=u.map(((t,a)=>Object.assign([t[0]-.5,b[a][1]+.5],{data:t.data})));f.append("path").attr("d",m(x)),f.append("g").selectAll("path").data(r).enter().append("a").attr("href",(t=>`https://github.com/d3/${t.key}`)).attr("target","_blank").append("path").attr("class","area").attr("d",m).attr("fill",(t=>k(t.key))).append("title").text((t=>t.key));const y=f.append("g").selectAll("text").data(r);y.enter().append("text").attr("class","area-label").merge(y).text((t=>t.key)).attr("transform",a.areaLabel(m))})((a=>{a.forEach((a=>{a.date=t.utcWeek.floor(r(a.date.split(" ")[0]))}));const s=t.group(a,(t=>t.date),n),d=t.group(a,n),c=Array.from(d.keys()),[o,l]=t.extent(a,(t=>t.date)),i=t.utcWeeks(o,l),p=new Map;for(const t of c){const a=i.map((a=>{const e=s.get(a),r=e?e.get(t):null;return r?r.length:0})),r=e.blur().radius(15)(a);p.set(t,r)}const g=[];return i.forEach(((t,a)=>{const e={date:t};for(let t of c)e[t]=p.get(t)[a];g.push(e)})),{data:a,stackedData:t.stack().offset(t.stackOffsetWiggle).order(t.stackOrderAppearance).keys(c)(g)}})(g))}))}(d3,d3AreaLabel,arrayBlur);
//# sourceMappingURL=bundle.js.map

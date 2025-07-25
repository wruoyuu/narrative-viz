const width = 900;
const height = 600;
const margin = { top: 50, right: 30, bottom: 60, left: 60 };

let currentScene = 0;
let data;

const svg = d3.select("#visualization")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

function showScene(sceneIndex) {
  currentScene = sceneIndex;
  svg.selectAll("*").remove();
  if (sceneIndex === 0) showScene1();
  else if (sceneIndex === 1) showScene2();
  else if (sceneIndex === 2) showScene3();
}

d3.csv("filtered_merged_pokemon.csv").then(csv => {
  csv.forEach(d => {
    d.total = +d.total;
    d["Number of votes"] = +d["Number of votes"];
    d.attack = +d.attack;
    d.defense = +d.defense;
    d.hp = +d.hp;
  });
  data = csv;
  showScene(0);
});

function showScene1() {
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.total))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d["Number of votes"]))
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .classed("scene-title", true)
    .text("Scene 1: Popularity vs Total Base Stats");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - margin.bottom / 3)
    .attr("text-anchor", "middle")
    .classed("axis-label", true)
    .text("Total Base Stats (sum of HP, Attack, Defense, etc)");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 40)
    .attr("text-anchor", "middle")
    .classed("axis-label", true)
    .text("Number of Popularity Votes");

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.total))
    .attr("cy", d => y(d["Number of votes"]))
    .attr("r", 4)
    .attr("fill", "steelblue")
    .append("title")
    .text(d => d.name);
}

function showScene2() {
  const top10 = data.sort((a, b) => b["Number of votes"] - a["Number of votes"]).slice(0, 10);
  const x = d3.scaleBand()
    .domain(top10.map(d => d.name))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(top10, d => d["Number of votes"])])
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .classed("scene-title", true)
    .text("Scene 2: Top 10 Most Popular Pokémon");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - margin.bottom / 3 + 20)
    .attr("text-anchor", "middle")
    .classed("axis-label", true)
    .text("Pokémon");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 40)
    .attr("text-anchor", "middle")
    .classed("axis-label", true)
    .text("Number of Popularity Votes");

  svg.selectAll("rect")
    .data(top10)
    .enter()
    .append("rect")
    .attr("x", d => x(d.name))
    .attr("y", d => y(d["Number of votes"]))
    .attr("width", x.bandwidth())
    .attr("height", d => height - margin.bottom - y(d["Number of votes"]))
    .attr("fill", "orange")
    .append("title")
    .text(d => `${d.name}: ${d["Number of votes"]} votes`);
}

function showScene3() {
  const typeCounts = d3.rollup(data, v => v.length, d => d.type1);
  const types = Array.from(typeCounts, ([type, count]) => ({ type, count }));

  const x = d3.scaleBand()
    .domain(types.map(d => d.type))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(types, d => d.count)])
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .classed("scene-title", true)
    .text("Scene 3: Distribution of Primary Pokémon Types");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - margin.bottom / 3 + 20)
    .attr("text-anchor", "middle")
    .classed("axis-label", true)
    .text("Primary Type");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 40)
    .attr("text-anchor", "middle")
    .classed("axis-label", true)
    .text("Number of Pokémon");

  svg.selectAll("rect")
    .data(types)
    .enter()
    .append("rect")
    .attr("x", d => x(d.type))
    .attr("y", d => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", d => height - margin.bottom - y(d.count))
    .attr("fill", "mediumseagreen")
    .append("title")
    .text(d => `${d.type}: ${d.count}`);
}
const width = 900;
const height = 450;
const margin = { top: 60, right: 50, bottom: 100, left: 80 };

let currentScene = 0;
let data;
let animationTimer = null;
let animationIndex = 0;
let voteDots = [];
let dots;
let typeCounts = {};
let barScaleX, barScaleY;
let bars;
const dotSize = 6;
const columns = 50;
const padding = 2;
const dotSpacing = dotSize + padding;
const types = [];
const typeColors = d3.scaleOrdinal()
  .domain([
    "Grass", "Fire", "Water", "Bug", "Normal", "Poison", "Electric",
    "Ground", "Fairy", "Fighting", "Psychic", "Rock", "Ghost", "Ice",
    "Dragon", "Dark", "Steel", "Flying"
  ])
  .range([
    "#78C850", "#F08030", "#6890F0", "#A8B820", "#A8A878", "#A040A0",
    "#F8D030", "#E0C068", "#EE99AC", "#C03028", "#F85888", "#B8A038",
    "#705898", "#98D8D8", "#7038F8", "#705848", "#B8B8D0", "#A890F0"
  ]);

const svg = d3.select("#visualization")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

function showScene(sceneIndex) {
  currentScene = sceneIndex;
  svg.selectAll("*").remove();

  // Hide play/pause buttons by default
  document.getElementById("play-btn").style.display = "none";
  document.getElementById("pause-btn").style.display = "none";

  if (sceneIndex === 0) showScene1();
  else if (sceneIndex === 1) showScene2();
  else if (sceneIndex === 2) showScene3();
  else if (sceneIndex === 3) {
    showScene4();
    // animation does NOT start automatically
  }
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
    .attr("y", height - margin.bottom + 80)
    .attr("text-anchor", "middle")
    .classed("axis-label", true)
    .text("Total Base Stats (sum of HP, Attack, Defense, etc)");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", margin.left - 60)
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
    .attr("y", height - margin.bottom + 80)
    .attr("text-anchor", "middle")
    .classed("axis-label", true)
    .text("Pokémon");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", margin.left - 60)
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
    .attr("y", height - margin.bottom + 80)
    .attr("text-anchor", "middle")
    .classed("axis-label", true)
    .text("Primary Type");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", margin.left - 60)
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

// Scene 4: FlowingData-style animation in D3 where each dot represents a Pokémon and bars grow by votes
function showScene4() {
  if (animationTimer) {
    animationTimer.stop();
    animationTimer = null;
  }
  animationIndex = 0;
  svg.selectAll("*").remove();

  // Bar chart setup
  const barWidth = 300;
  const barMargin = { top: 70, right: 30, bottom: 20, left: 40 };
  const barHeight = 300;
  const barX = width - barWidth - 20;

  // Pokémon types & colors
  types.splice(0, types.length);
  data.forEach(p => {
    if (!types.includes(p.type1)) types.push(p.type1);
  });

  const typeColorMap = {
    Grass: "#78C850",
    Fire: "#F08030",
    Water: "#6890F0",
    Bug: "#A8B820",
    Normal: "#A8A878",
    Poison: "#A040A0",
    Electric: "#F8D030",
    Ground: "#E0C068",
    Fairy: "#EE99AC",
    Fighting: "#C03028",
    Psychic: "#F85888",
    Rock: "#B8A038",
    Ghost: "#705898",
    Ice: "#98D8D8",
    Dragon: "#7038F8",
    Dark: "#705848",
    Steel: "#B8B8D0",
    Flying: "#A890F0"
  };
  typeColors.domain(types).range(types.map(t => typeColorMap[t] || "#ccc"));

  // Create dot array where each dot = 1 Pokémon
  voteDots = [];
  data.forEach(p => {
    voteDots.push({ name: p.name, type: p.type1, votes: p["Number of votes"] });
  });
  voteDots = d3.shuffle(voteDots);

  // Initialize vote totals
  typeCounts = {};
  types.forEach(t => (typeCounts[t] = 0));

  barScaleX = d3.scaleLinear()
    .domain([0, 1])
    .range([0, barWidth - barMargin.left - barMargin.right]);

  barScaleY = d3.scaleBand()
    .domain(types)
    .range([barMargin.top, barMargin.top + barHeight])
    .padding(0.1);

  const barsGroup = svg.append("g")
    .attr("class", "bars")
    .attr("transform", `translate(${barX + barMargin.left}, 0)`);

  // Bar rectangles
  barsGroup.selectAll("rect")
    .data(types)
    .enter()
    .append("rect")
    .attr("y", d => barScaleY(d))
    .attr("height", barScaleY.bandwidth())
    .attr("x", 0)
    .attr("width", 0)
    .attr("fill", d => typeColors(d));

  // Fixed type labels on the left
  const labelX = barX + barMargin.left - 10;
  svg.append("g")
    .attr("class", "type-labels")
    .selectAll("text")
    .data(types)
    .enter()
    .append("text")
    .attr("x", labelX)
    .attr("y", d => barScaleY(d) + barScaleY.bandwidth() / 2)
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "middle")
    .attr("font-weight", "bold")
    .text(d => d);

  // Bar count labels
  barsGroup.selectAll(".count-label")
    .data(types)
    .enter()
    .append("text")
    .attr("class", "count-label")
    .attr("y", d => barScaleY(d) + barScaleY.bandwidth() / 2)
    .attr("x", 0)
    .attr("alignment-baseline", "middle")
    .attr("fill", "black")
    .attr("font-weight", "bold")
    .text("0");

  // Titles
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .text("Scene 4: Pokémon Type Visualization");

  svg.append("text")
    .attr("x", 20)
    .attr("y", 50)
    .attr("text-anchor", "start")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Each Dot = One Pokémon");

  svg.append("text")
    .attr("x", barX + barMargin.left)
    .attr("y", 50)
    .attr("text-anchor", "start")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Bar Chart = Total Votes by Type");

  // Draw gray dots
  dots = svg.append("g")
    .attr("class", "dots")
    .attr("transform", `translate(20, 70)`)
    .selectAll("rect")
    .data(voteDots)
    .enter()
    .append("rect")
    .attr("x", (d, i) => (i % columns) * dotSpacing)
    .attr("y", (d, i) => Math.floor(i / columns) * dotSpacing)
    .attr("width", dotSize)
    .attr("height", dotSize)
    .attr("fill", "#ccc");

  animationIndex = 0;

  document.getElementById("play-btn").style.display = "inline-block";
  document.getElementById("pause-btn").style.display = "none";
}

function playAnimation() {
  if (animationTimer) return;

  document.getElementById("play-btn").style.display = "none";
  document.getElementById("pause-btn").style.display = "inline-block";

  animationTimer = d3.interval(() => {
    if (animationIndex >= voteDots.length) {
      animationTimer.stop();
      animationTimer = null;
      document.getElementById("play-btn").style.display = "inline-block";
      document.getElementById("pause-btn").style.display = "none";
      return;
    }

    const dot = voteDots[animationIndex];
    const sel = d3.select(dots.nodes()[animationIndex]);
    sel.transition()
      .duration(200)
      .attr("fill", typeColors(dot.type));

    typeCounts[dot.type] += dot.votes;

    barScaleX.domain([0, d3.max(Object.values(typeCounts))]);

    const barsGroup = svg.select("g.bars");

    barsGroup.selectAll("rect")
      .data(types, d => d)
      .transition()
      .duration(300)
      .attr("width", d => barScaleX(typeCounts[d]));

    barsGroup.selectAll(".count-label")
      .data(types, d => d)
      .transition()
      .duration(300)
      .attr("x", d => barScaleX(typeCounts[d]) + 15)
      .text(d => typeCounts[d]);

    animationIndex++;
  }, 50);
}

function pauseAnimation() {
  if (!animationTimer) return;

  animationTimer.stop();
  animationTimer = null;

  document.getElementById("play-btn").style.display = "inline-block";
  document.getElementById("pause-btn").style.display = "none";
}

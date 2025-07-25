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

// Scene 2: Top Ten Pokemon Flow Chart
function showScene2() {
  svg.selectAll("*").remove();

  const pokeIdByName = {
    "Bulbasaur": 1,
    "Arcanine": 59,
    "Blaziken": 257,
    "Charizard": 6,
    "Gengar": 94,
    "Lucario": 448,
    "Umbreon": 197,
    "Sylveon": 700,
    "Pikachu": 25,
    "Eevee": 133,
    "Gardevoir": 282,
    "Dragonite": 149
  };

  const top10 = data
    .sort((a, b) => b["Number of votes"] - a["Number of votes"])
    .slice(0, 10);

  top10.forEach(d => {
    const id = pokeIdByName[d.name];
    d.imageURL = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  });

  const availableWidth = width - margin.left - margin.right;
  const spacing = availableWidth / (top10.length - 1);
  const radius = Math.min(45, spacing / 2 - 10);
  const startX = margin.left;
  const centerY = height / 2 - 70;

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .classed("scene-title", true)
    .text("Top 10 Most Popular Pokémon");

  // Arrowhead marker
  svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 10)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#666");

  const positions = top10.map((d, i) => ({
    x: startX + i * spacing,
    y: centerY
  }));

  // Draw arrows between nodes
  for (let i = 0; i < top10.length - 1; i++) {
    svg.append("line")
      .attr("x1", positions[i].x + radius)
      .attr("y1", positions[i].y)
      .attr("x2", positions[i + 1].x - radius)
      .attr("y2", positions[i + 1].y)
      .attr("stroke", "#666")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");
  }

  const nodes = svg.selectAll("g.node")
    .data(top10)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (d, i) => `translate(${positions[i].x}, ${positions[i].y})`);

  nodes.append("circle")
    .attr("r", radius)
    .attr("fill", "#ffd966")
    .attr("stroke", "#b38600")
    .attr("stroke-width", 3);

  nodes.append("image")
    .attr("xlink:href", d => d.imageURL)
    .attr("x", -radius * 0.7)
    .attr("y", -radius * 0.7)
    .attr("width", radius * 1.4)
    .attr("height", radius * 1.4);

  nodes.append("text")
    .attr("y", radius + 20)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .text(d => d.name);

  nodes.append("text")
    .attr("y", radius + 40)
    .attr("text-anchor", "middle")
    .text(d => `${d["Number of votes"]} votes`);

    const tooltip = d3.select("#tooltip");

  nodes.on("mouseover", function (event, d) {
    tooltip
      .style("display", "block")
      .html(`
        <strong>${d.name}</strong><br>
        Type: ${d.type1}${d.type2 ? " / " + d.type2 : ""}
      `);
  })
  .on("mousemove", function (event) {
    tooltip
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", function () {
    tooltip.style("display", "none");
  });

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
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .classed("scene-title", true)
    .text("Pokémon Type Visualization");

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

  // Add the popular type and total votes text below the dots
  const dotsHeight = Math.ceil(voteDots.length / columns) * dotSpacing;
  const popularTypeTextY = 110 + dotsHeight + 30;  // dots group y (70 + 40 margin) + dots height + 30 px gap
  const totalVotesTextY = popularTypeTextY + 30;

  // Remove previous text if any
  svg.selectAll("text.popular-type-text, text.total-votes-text").remove();

  svg.append("text")
    .attr("class", "popular-type-text")
    .attr("x", 20)
    .attr("y", popularTypeTextY)
    .attr("text-anchor", "left")
    .text("Most Popular Type: None (0%)");

  svg.append("text")
    .attr("class", "total-votes-text")
    .attr("x", 20)
    .attr("y", totalVotesTextY)
    .attr("text-anchor", "left")
    .text("Total Votes: 0");

  animationIndex = 0;

  document.getElementById("play-btn").style.display = "inline-block";
  document.getElementById("pause-btn").style.display = "none";
  document.getElementById("restart-btn").style.display = "inline-block";
}

function playAnimation() {
  if (animationTimer) return;

  // If finished, restart from beginning
  if (animationIndex >= voteDots.length) {
    showScene4();  // Reset the scene
    setTimeout(() => {
      playAnimation();  // Restart after re-initializing
    }, 100);  // Small delay to ensure DOM updates
    return;
  }

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

    // Calculate total votes so far
    const totalVotes = Object.values(typeCounts).reduce((a, b) => a + b, 0);

    // Find most popular type and percentage
    let maxType = "None";
    let maxCount = 0;
    for (const t of types) {
      if (typeCounts[t] > maxCount) {
        maxCount = typeCounts[t];
        maxType = t;
      }
    }
    const percent = totalVotes > 0 ? ((maxCount / totalVotes) * 100).toFixed(1) : 0;

    // Update popular type and total votes text
    svg.select("text.popular-type-text")
      .text(`Most Popular Type: ${maxType} (${percent}%)`);

    svg.select("text.total-votes-text")
      .text(`Total Votes: ${totalVotes}`);

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

function restartAnimation() {
  if (animationTimer) {
    animationTimer.stop();
    animationTimer = null;
  }
  animationIndex = 0;

  // Reset all dots to gray
  dots.attr("fill", "#ccc");

  // Reset counts
  types.forEach(t => (typeCounts[t] = 0));

  // Reset bars width and count labels
  const barsGroup = svg.select("g.bars");
  barsGroup.selectAll("rect")
    .transition()
    .duration(300)
    .attr("width", 0);

  barsGroup.selectAll(".count-label")
    .transition()
    .duration(300)
    .attr("x", 0)
    .text("0");

  // Reset texts
  svg.select(".popular-type-text")
    .text("Most Popular Type: None (0%)");
  svg.select(".total-votes-text")
    .text("Total Votes: 0");

  // Update buttons: show Play, hide Pause
  document.getElementById("play-btn").style.display = "inline-block";
  document.getElementById("pause-btn").style.display = "none";
}

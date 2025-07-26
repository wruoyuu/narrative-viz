const width = 1000;
const height = 450;
const margin = { top: 60, right: 200, bottom: 100, left: 200 }; // Equal left/right margins

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

const pokeDescriptions = {
  "Charizard": "Charizard received 1107 total votes in the Pokémon popularity poll. Charizard ranked 1 in terms of popularity among all the surveyed Pokémon. Charizard is a Fire/Flying-type Pokémon. Charizard has the Blaze ability. Charizard's weaknesses are Water, Electric, and Rock. Rock is super effective against Charizard. If Charizard becomes truly angered, the flame at the tip of its tail burns in a light blue shade.",
  "Gengar": "Gengar received 1056 total votes in the Pokémon popularity poll. Gengar ranked 2 in terms of popularity among all the surveyed Pokémon.  Gengar is a Ghost/Poison-type Pokémon. Gengar has the Cursed Body ability. Gengar's weaknesses are Ground, Psychic, Ghost, and Dark. To steal the life of its target, it slips into the prey’s shadow and silently waits for an opportunity.",
  "Arcanine": "Arcanine received 923 total votes in the Pokémon popularity poll. Arcanine ranked 3 in terms of popularity among all the surveyed Pokémon.  Arcanine is a Fire-type Pokémon. Arcanine has the Intimidate and Flashfire abilities. Arcanine's weaknesses are Water, Ground, and Rock. An ancient picture scroll shows that people were captivated by its movement as it ran through prairies.",
  "Bulbasaur": "Bulbasaur received 710 total votes in the Pokémon popularity poll. Bulbasaur ranked 4 in terms of popularity among all the surveyed Pokémon.  Bulbasaur is a Grass/Poison-type Pokémon. Bulbasaur has the Overgrow ability. Bulbasaur's weaknesses are Fire, Ice, Flying, and Psychic. For some time after its birth, it uses the nutrients that are packed into the seed on its back in order to grow.",
  "Blaziken": "Blaziken received 613 total votes in the Pokémon popularity poll. Blaziken ranked 5 in terms of popularity among all the surveyed Pokémon.  Blaziken is a Fire/Fighting-type Pokémon. Blaziken has the Blaze ability. Blaziken's weaknesses are Water, Ground, Flying, and Psychic. When facing a tough foe, it looses flames from its wrists. Its powerful legs let it jump clear over buildings.",
  "Umbreon": "Umbreon received 607 total votes in the Pokémon popularity poll. Umbreon ranked 6 in terms of popularity among all the surveyed Pokémon.  Umbreon is a Dark-type Pokémon. Umbreon has the Synchronize ability. Umbreon's weaknesses are Fighting, Bug, and Fairy. When exposed to the moon’s aura, the rings on its body glow faintly and it gains a mysterious power.",
  "Lucario": "Lucario received 604 total votes in the Pokémon popularity poll. Lucario ranked 7 in terms of popularity among all the surveyed Pokémon.  Lucario is a Fighting/Steel-type Pokémon. Lucario has the Inner Focus and Steadfast abilities. Lucario's weaknesses are Fire, Fighting, and Ground. It’s said that no foe can remain invisible to Lucario, since it can detect auras—even those of foes it could not otherwise see.",
  "Gardevoir": "Gardevoir received 585 total votes in the Pokémon popularity poll. Gardevoir ranked 8 in terms of popularity among all the surveyed Pokémon.  Gardevoir is a Psychic/Fairy-type Pokémon. Gardevoir has the Synchronize and Trace abilities. Gardevoir's weaknesses are Poison, Ghost, and Steel. To protect its Trainer, it will expend all its psychic power to create a small black hole",
  "Eevee": "Eevee received 581 total votes in the Pokémon popularity poll. Eevee ranked 9 in terms of popularity among all the surveyed Pokémon.  Eevee is a Normal-type Pokémon. Eevee has the Run Away and Adaptability abilities. Eevee's weakness is Fighting. Its ability to evolve into many forms allows it to adapt smoothly and perfectly to any environment.",
  "Dragonite": "Dragonite received 551 total votes in the Pokémon popularity poll. Dragonite ranked 10 in terms of popularity among all the surveyed Pokémon.  Dragonite is a Dragon/Flying-type Pokémon. Dragonite has the Inner Focus ability. Dragonite's weaknesses are Ice, Rock, Dragon, and Fairy. Ice is super effective against Dragonite. It is said that somewhere in the ocean lies an island where these gather. Only they live there.",
};

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

const svg = d3.select("#visualization")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

function showScene(sceneIndex) {
  currentScene = sceneIndex;
  localStorage.setItem("lastScene", currentScene);
  svg.selectAll("*").remove();

  // Hide play/pause buttons by default
  document.getElementById("play-btn").style.display = "none";
  document.getElementById("pause-btn").style.display = "none";
  document.getElementById("restart-btn").style.display = "none";

  if (sceneIndex === 0) showScene1();
  else if (sceneIndex === 1) showScene2();
  else if (sceneIndex === 2) {
    showScene3();
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
    d.speed = +d.speed;
    d.sp_attack = +d.sp_attack;
    d.sp_defense = +d.sp_defense;
  });
  data = csv;
  // showScene(0);
  // Get the last scene from localStorage, or default to 0
  const savedScene = +localStorage.getItem("lastScene");
  showScene(!isNaN(savedScene) ? savedScene : 0);
});

let currentAttrIndex = 0;
const statAttributes = ["total", "attack", "defense", "hp", "speed", "sp_attack", "sp_defense"];

// Scene 1: Slide Show of Popularity vs Base Stats
function showScene1() {
  renderAttributeSlide(statAttributes[currentAttrIndex]);
}

function renderAttributeSlide(attr) {
  svg.selectAll("*").remove(); // Clear previous chart

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .classed("scene-title", true)
    .text(`Popularity vs Base Stat`);

  // Create a group to hold the chart elements and shift it down
  const chartGroup = svg.append("g")
    .attr("transform", "translate(0, 40)");

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d[attr]))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d["Number of votes"]))
    .range([height - margin.bottom, margin.top]);

  chartGroup.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  chartGroup.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2 + 35)
    .attr("text-anchor", "middle")
    .classed("scene-subtitle", true)
    .text(`Popularity vs ${formatAttributeName(attr)}`);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - margin.bottom + 95)
    .attr("text-anchor", "middle")
    .classed("axis-label", true)
    .text(`${formatAttributeName(attr)}`);

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", margin.left - 60)
    .attr("text-anchor", "middle")
    .classed("axis-label", true)
    .text("Number of Popularity Votes");

  chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d[attr]))
    .attr("cy", d => y(d["Number of votes"]))
    .attr("r", 5)
    .attr("fill", d => {
      // Use type1 if available, fallback to type
      const pokemonType = d.type1 || d.type || "Normal"; 
      return typeColors(pokemonType);
    })
    .attr("opacity", 0.8)
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .append("title")
    .text(d => `${d.name} (${d.type1 || d.type})`); // Show type in tooltip

  // Add "Next" button
  svg.append("text")
    .attr("x", width - margin.right)
    .attr("y", height)
    .attr("text-anchor", "end")
    .style("cursor", "pointer")
    .style("fill", "blue")
    .text("Next Attribute →")
    .on("click", () => {
      currentAttrIndex = (currentAttrIndex + 1) % statAttributes.length;
      renderAttributeSlide(statAttributes[currentAttrIndex]);
    });

  // Add "Previous" button
  svg.append("text")
    .attr("x", margin.left)
    .attr("y", height)
    .attr("text-anchor", "start") 
    .style("cursor", "pointer")
    .style("fill", "blue")
    .text("← Previous Attribute")
    .on("click", () => {
      currentAttrIndex = (currentAttrIndex - 1 + statAttributes.length) % statAttributes.length; 
      renderAttributeSlide(statAttributes[currentAttrIndex]);
  });
}

function formatAttributeName(attr) {
  return attr
    .replace("_", " ")
    .replace(/\b\w/g, l => l.toUpperCase()); // capitalize words
}

// Scene 2: Magazine Visual of Top 10 Pokemon
function showScene2() {
  svg.selectAll("*").remove();

  const top10 = data
    .sort((a, b) => b["Number of votes"] - a["Number of votes"])
    .slice(0, 10);

  top10.forEach(d => {
    const id = pokeIdByName[d.name];
    d.imageURL = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    d.type = d.type1 || d.type;
  });

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2 + 35)
    .attr("text-anchor", "middle")
    .classed("scene-subtitle2", true)
    .text(`Please click on each Pokémon for more detail.`);

  // Adjust margins for better layout
  const barMargin = { top: 80, right: 350, bottom: 80, left: 150 };
  const barWidth = (width - barMargin.left - barMargin.right) / 2; // Half width for bars
  const barHeight = height - barMargin.top - barMargin.bottom;

  // Create scale with HALF range to match bars
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(top10, d => d["Number of votes"])])
    .range([0, barWidth]); // Range is now half of original

  const yScale = d3.scaleBand()
    .domain(top10.map(d => d.name))
    .range([0, barHeight])
    .padding(0.3);

  // Main chart group
  const chartGroup = svg.append("g")
    .attr("transform", `translate(${barMargin.left}, ${barMargin.top})`);

  // Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", barMargin.top / 2)
    .attr("text-anchor", "middle")
    .classed("scene-title", true)
    .text("Top 10 Most Popular Pokémon");

  // Add x-axis (now matches bar lengths)
  chartGroup.append("g")
    .attr("transform", `translate(0, ${barHeight})`)
    .call(d3.axisBottom(xScale).ticks(5)) // Uses same scale as bars
    .selectAll("text")
    .style("font-size", "12px");

  // Add y-axis
  chartGroup.append("g")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("font-size", "14px")
    .style("font-weight", "bold");

  // Add axis labels
  svg.append("text")
    .attr("x", barMargin.left + barWidth / 2) // Centered over bars
    .attr("y", height - barMargin.bottom / 2 + 10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Number of Votes");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", barMargin.left / 2 - 20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Pokémon");

  // Bars (now using full scale range)
  chartGroup.selectAll("rect")
    .data(top10)
    .enter()
    .append("rect")
    .attr("y", d => yScale(d.name))
    .attr("width", d => xScale(d["Number of votes"])) // No division now
    .attr("height", yScale.bandwidth())
    .attr("fill", d => typeColors(d.type))
    .attr("rx", 4)
    .attr("ry", 4);

  // Value labels (adjusted for new scale)
  chartGroup.selectAll("text.bar-label")
    .data(top10)
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("x", d => xScale(d["Number of votes"]) - 10) // Closer to end
    .attr("y", d => yScale(d.name) + yScale.bandwidth() / 2 + 5)
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .style("fill", "white")
    .style("font-weight", "bold")
    .text(d => d["Number of votes"]);

  // Pokémon images - positioned closer to bar graph
  const imageColGap = 100; // Reduced from previous larger gap
  const imageColWidth = 120; // Total width for image columns
  const imageGroup = svg.append("g")
    .attr("transform", `translate(${barMargin.left + barWidth + imageColGap}, ${barMargin.top})`); // Right after bars

  const imageSize = 40;
  const colWidth = 70; // Width per column
  const rowHeight = 75; // Height per row

  // Create 2 columns of 5 images each
  const imageNodes = imageGroup.selectAll("g")
    .data(top10)
    .enter()
    .append("g")
    .attr("transform", (d, i) => {
      const col = i < 5 ? 0 : colWidth;
      const row = i % 5;
      return `translate(${col}, ${row * rowHeight})`;
    })
    .style("cursor", "pointer")
    .on("click", (event, d) => updateDescription(d.name));

  // Image backgrounds
  imageNodes.append("rect")
    .attr("width", imageSize + 15)
    .attr("height", imageSize + 15)
    .attr("rx", 6)
    .attr("fill", d => typeColors(d.type))
    .attr("opacity", 0.2);

  // Pokémon images
  imageNodes.append("image")
    .attr("xlink:href", d => d.imageURL)
    .attr("width", imageSize)
    .attr("height", imageSize)
    .attr("x", 7.5)
    .attr("y", 7.5);

  // Pokémon names
  imageNodes.append("text")
    .attr("x", (imageSize + 15) / 2)
    .attr("y", imageSize + 25)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text(d => d.name);

  // Description box to the right of the images
  const descBoxGap = 20;
  const descBoxWidth = 250;
  const descBoxHeight = 5 * rowHeight; // Match total height of image columns

  const descBox = svg.append("foreignObject")
    .attr("x", barMargin.left + barWidth + imageColGap + imageColWidth + descBoxGap)
    .attr("y", barMargin.top)
    .attr("width", descBoxWidth)
    .attr("height", descBoxHeight)
    .style("overflow", "hidden"); // Remove scrollbar

  const descDiv = descBox.append("xhtml:div")
    .style("padding", "15px")
    .style("background", "#f8f8f8")
    .style("border-radius", "8px")
    .style("box-shadow", "0 2px 8px rgba(0,0,0,0.1)")
    .style("font-size", "14px") // Slightly smaller font
    .style("line-height", "1.4") // Tighter line spacing
    .html(`
      <h3 style="margin:0 0 10px 0;color:#333">${top10[0].name}</h3>
      <p style="margin:0;color:#555">${pokeDescriptions[top10[0].name]}</p>
    `);

  // Update function with optimized text fitting
  function updateDescription(name) {
    const description = pokeDescriptions[name] || "No description available.";
    
    descDiv.html(`
      <h3 style="margin:0 0 10px 0;color:#333">${name}</h3>
      <p style="margin:0;color:#555">${description}</p>
    `);
  }
}

// Scene 3: FlowingData-style animation in D3 where each dot represents a Pokémon and bars grow by votes - Video Visual Genre
function showScene3() {
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
    .attr("y", 60)
    .attr("text-anchor", "start")
    .classed("scene-subtitle2", true)
    .text("One Dot = One Pokémon");

  svg.append("text")
    .attr("x", barX + barMargin.left)
    .attr("y", 60)
    .attr("text-anchor", "start")
    .classed("scene-subtitle2", true)
    .text("Total Votes by Pokémon Type");

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
    .attr("x", 17)
    .attr("y", popularTypeTextY)
    .attr("text-anchor", "left")
    .text("Most Popular Type: None (0%)");

  svg.append("text")
    .attr("class", "total-votes-text")
    .attr("x", 17)
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
    showScene3();  // Reset the scene
    setTimeout(() => {
      playAnimation();  // Restart after re-initializing
    }, 100);  // Small delay to ensure DOM updates
    return;
  }

  document.getElementById("play-btn").style.display = "none";
  document.getElementById("pause-btn").style.display = "inline-block";
  document.getElementById("restart-btn").style.display = "none";

  animationTimer = d3.interval(() => {
    if (animationIndex >= voteDots.length) {
      animationTimer.stop();
      animationTimer = null;

      document.getElementById("play-btn").style.display = "inline-block";
      document.getElementById("pause-btn").style.display = "none";
      document.getElementById("restart-btn").style.display = "inline-block";
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
  document.getElementById("restart-btn").style.display = "inline-block";
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
  document.getElementById("restart-btn").style.display = "inline-block";
}

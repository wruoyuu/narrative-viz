// script.js

// Global state
let currentScene = 0;
const totalScenes = 4;

// Load a sample CSV file to test data loading
d3.csv("college_data/c2017_b_rv.csv").then(data => {
  d3.select("#loading").style("display", "none");

  // Log data to verify
  console.log("CSV loaded:", data.slice(0, 5));

  // Draw initial chart (basic race-based completions)
  drawScene1(data);
}).catch(err => {
  console.error("Data loading error:", err);
  d3.select("#loading").text("Failed to load data.");
});

// Scene rendering
function drawScene1(data) {
  d3.select("#chart").selectAll("*").remove(); // Clear previous

  // Simple bar chart: completions by race
  const raceKeys = [
    "Black or African American",
    "Hispanic/Latino",
    "White",
    "Asian",
    "American Indian or Alaska Native"
  ];

  const margin = { top: 20, right: 20, bottom: 50, left: 100 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const completionData = raceKeys.map(race => {
    const total = d3.sum(data, d => +d[race] || 0);
    return { race, total };
  });

  const x = d3.scaleLinear()
    .domain([0, d3.max(completionData, d => d.total)])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(completionData.map(d => d.race))
    .range([0, height])
    .padding(0.2);

  svg.selectAll(".bar")
    .data(completionData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", d => y(d.race))
    .attr("width", d => x(d.total))
    .attr("height", y.bandwidth())
    .attr("fill", "#5b9bd5");

  svg.append("g")
    .call(d3.axisLeft(y));

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));
}

// Scene navigation buttons
d3.select("#prevBtn").on("click", () => {
  if (currentScene > 0) {
    currentScene--;
    updateScene();
  }
});

d3.select("#nextBtn").on("click", () => {
  if (currentScene < totalScenes - 1) {
    currentScene++;
    updateScene();
  }
});

// Update scene indicator
function updateScene() {
  d3.select("#scene-indicator").text(`Scene ${currentScene + 1} of ${totalScenes}`);
  console.log("Switched to scene", currentScene);
  // TODO: Call appropriate scene drawing function
}

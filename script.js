// Global state
let currentScene = 0;
const totalScenes = 4;
let allData = null;

let currentInstitutionType = "all";
let currentDemographic = "all";

const margin = { top: 20, right: 20, bottom: 50, left: 150 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Load CSV once and store globally
d3.csv("college_data/c2017_b_rv.csv", d => {
  // Convert numeric columns to numbers
  return {
    ...d,
    CONTROL: +d.CONTROL,
    CSBKAAT: +d.CSBKAAT,
    CSHISPT: +d.CSHISPT,
    CSWHITT: +d.CSWHITT,
    CSASIAW: +d.CSASIAW,
    CSAIANT: +d.CSAIANT
  };
}).then(data => {
  allData = data;
  d3.select("#loading").style("display", "none");
  console.log("CSV loaded:", data.slice(0, 5));
  updateScene(); // Initial draw
}).catch(err => {
  console.error("Data load error:", err);
  d3.select("#loading").text("Failed to load data.");
});

// Dropdown filter listeners
d3.select("#institution-type").on("change", function () {
  currentInstitutionType = this.value;
  updateScene();
});

d3.select("#demographic").on("change", function () {
  currentDemographic = this.value;
  updateScene();
});

// Filtering logic
function filterData(data) {
  let filtered = data;

  if (currentInstitutionType === "public") {
    filtered = filtered.filter(d => d.CONTROL === 1);
  } else if (currentInstitutionType === "private") {
    filtered = filtered.filter(d => d.CONTROL === 2 || d.CONTROL === 3);
  }

  return filtered;
}

// Scene 1: Bar chart by demographic
function drawScene1(data) {
  const svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  svg.selectAll("*").remove();

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const allRaceKeys = [
    "CSBKAAT", // Black
    "CSHISPT", // Hispanic
    "CSWHITT", // White
    "CSASIAW", // Asian
    "CSAIANT"  // Native American
  ];

  const raceLabels = {
    CSBKAAT: "Black or African American",
    CSHISPT: "Hispanic/Latino",
    CSWHITT: "White",
    CSASIAW: "Asian",
    CSAIANT: "American Indian or Alaska Native"
  };

  let raceKeysToShow;
  switch (currentDemographic) {
    case "black": raceKeysToShow = ["CSBKAAT"]; break;
    case "hispanic": raceKeysToShow = ["CSHISPT"]; break;
    case "white": raceKeysToShow = ["CSWHITT"]; break;
    case "asian": raceKeysToShow = ["CSASIAW"]; break;
    case "native": raceKeysToShow = ["CSAIANT"]; break;
    default: raceKeysToShow = allRaceKeys; break;
  }

  const completionData = raceKeysToShow.map(col => {
    const total = d3.sum(data, d => d[col] || 0);
    return { race: raceLabels[col], total };
  });

  const maxTotal = d3.max(completionData, d => d.total);
  const x = d3.scaleLinear().domain([0, maxTotal]).range([0, width]);
  const y = d3.scaleBand()
    .domain(completionData.map(d => d.race))
    .range([0, height])
    .padding(0.2);

  // Bars
  g.selectAll(".bar")
    .data(completionData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", d => y(d.race))
    .attr("width", d => x(d.total))
    .attr("height", y.bandwidth())
    .attr("fill", "#5b9bd5");

  // Axes
  g.append("g").call(d3.axisLeft(y));
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Label
  g.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + 40)
    .text("Total Completions");
}

// Placeholder scenes
function drawScene2(data) {
  d3.select("#chart").selectAll("*").remove();
  d3.select("#chart").append("text")
    .attr("x", 20).attr("y", 50)
    .text("Scene 2 - To be implemented");
}
function drawScene3(data) {
  d3.select("#chart").selectAll("*").remove();
  d3.select("#chart").append("text")
    .attr("x", 20).attr("y", 50)
    .text("Scene 3 - To be implemented");
}
function drawScene4(data) {
  d3.select("#chart").selectAll("*").remove();
  d3.select("#chart").append("text")
    .attr("x", 20).attr("y", 50)
    .text("Scene 4 - To be implemented");
}

// Scene switcher
function updateScene() {
  d3.select("#scene-indicator").text(`Scene ${currentScene + 1} of ${totalScenes}`);
  if (!allData) return;

  const filteredData = filterData(allData);

  switch (currentScene) {
    case 0: drawScene1(filteredData); break;
    case 1: drawScene2(filteredData); break;
    case 2: drawScene3(filteredData); break;
    case 3: drawScene4(filteredData); break;
  }
}

// Navigation
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

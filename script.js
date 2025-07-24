// Global state
let currentScene = 0;
const totalScenes = 4;
let allData = null;  // store CSV data globally

// Keep track of current filter values
let currentInstitutionType = "all";
let currentDemographic = "all";

const margin = { top: 20, right: 20, bottom: 50, left: 150 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Load CSV once and store data globally
d3.csv("college_data/c2017_b_rv.csv").then(data => {
  allData = data;
  d3.select("#loading").style("display", "none");
  console.log("CSV loaded:", data.slice(0, 5));
  updateScene();  // Draw initial scene
}).catch(err => {
  console.error("Data loading error:", err);
  d3.select("#loading").text("Failed to load data.");
});

// Add event listeners for filters
d3.select("#institution-type").on("change", function() {
  currentInstitutionType = this.value;
  updateScene();
});

d3.select("#demographic").on("change", function() {
  currentDemographic = this.value;
  updateScene();
});

function filterData(data) {
  let filtered = data;

  // Filter by institution type CONTROL column
  if (currentInstitutionType === "public") {
    filtered = filtered.filter(d => d.CONTROL === "1");
  } else if (currentInstitutionType === "private") {
    filtered = filtered.filter(d => d.CONTROL === "2" || d.CONTROL === "3");
  }

  // Filter rows by demographic selected: only institutions with >0 completions in that demographic
  if (currentDemographic !== "all") {
    const keyMap = {
      black: "CSBKAAT",
      hispanic: "CSHISPT",
      white: "CSWHITT",
      asian: "CSASIAW",
      native: "CSAIANT"
    };
    const col = keyMap[currentDemographic];
    filtered = filtered.filter(d => +d[col] > 0);
  }

  return filtered;
}

function drawScene1(data) {
  const svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  svg.selectAll("*").remove();

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define race columns & labels
  const allRaceKeys = [
    "CSBKAAT",
    "CSHISPT",
    "CSWHITT",
    "CSASIAW",
    "CSAIANT"
  ];

  const raceLabels = {
    CSBKAAT: "Black or African American",
    CSHISPT: "Hispanic/Latino",
    CSWHITT: "White",
    CSASIAW: "Asian",
    CSAIANT: "American Indian or Alaska Native"
  };

  let raceKeysToShow;

  if (currentDemographic === "all") {
    raceKeysToShow = allRaceKeys;
  } else if (currentDemographic === "black") {
    raceKeysToShow = ["CSBKAAT"];
  } else if (currentDemographic === "hispanic") {
    raceKeysToShow = ["CSHISPT"];
  } else if (currentDemographic === "white") {
    raceKeysToShow = ["CSWHITT"];
  } else if (currentDemographic === "asian") {
    raceKeysToShow = ["CSASIAW"];
  } else if (currentDemographic === "native") {
    raceKeysToShow = ["CSAIANT"];
  } else {
    raceKeysToShow = allRaceKeys;
  }

  // Sum totals for each race column
  const completionData = raceKeysToShow.map(colName => {
    const total = d3.sum(data, d => {
      const val = +d[colName];
      return isNaN(val) ? 0 : val;
    });
    return { race: raceLabels[colName], total };
  });

  console.log("Filtered completion data:", completionData);

  const maxTotal = d3.max(completionData, d => d.total);
  const x = d3.scaleLinear()
    .domain([0, maxTotal > 0 ? maxTotal : 10])
    .range([0, width]);

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

  // Y-axis (race names)
  g.append("g")
    .call(d3.axisLeft(y));

  // X-axis (totals)
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // X-axis label
  g.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + 40)
    .text("Total Completions");
}

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

function updateScene() {
  d3.select("#scene-indicator").text(`Scene ${currentScene + 1} of ${totalScenes}`);
  console.log("Switched to scene", currentScene);

  if (!allData) {
    console.warn("Data not loaded yet");
    return;
  }

  // Apply filters
  const filteredData = filterData(allData);

  switch(currentScene) {
    case 0:
      drawScene1(filteredData);
      break;
    case 1:
      drawScene2(filteredData);
      break;
    case 2:
      drawScene3(filteredData);
      break;
    case 3:
      drawScene4(filteredData);
      break;
  }
}

// Navigation buttons
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

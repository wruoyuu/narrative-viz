// State management
const state = {
  currentScene: 0,
  institutionType: 'all',
  demographic: 'all',
  completionData: [],
  enrollmentData: [],
  mergedData: []
};

// Scene configurations
const scenes = [
  {
    title: "National Completion Trends",
    description: "How graduation rates changed before, during, and after COVID-19",
    chartType: 'line'
  },
  {
    title: "Equity Gap Analysis",
    description: "Disparities in pandemic impacts by student demographics",
    chartType: 'bar'
  },
  {
    title: "Institutional Recovery",
    description: "Which schools bounced back fastest?",
    chartType: 'scatter'
  },
  {
    title: "Explore Your Institution",
    description: "Search for specific colleges",
    chartType: 'explore'
  }
];

// Load all data files
async function loadData() {
  showLoading(true);
  
  try {
    // Load completion data (revised files preferred)
    const completionFiles = [
      'data/completion/c2017_b_rv.csv',
      'data/completion/c2018_b_rv.csv',
      // ... all other files
      'data/completion/c2023_b.csv'
    ];
    
    state.completionData = await Promise.all(
      completionFiles.map(file => d3.csv(file))
    );

    // Load enrollment data
    const enrollmentFiles = [
      'data/enrollment/ef2017a_rv.csv',
      // ... other files
      'data/enrollment/ef2023a.csv'
    ];
    
    state.enrollmentData = await Promise.all(
      enrollmentFiles.map(file => d3.csv(file))
    );

    // Merge datasets
    state.mergedData = mergeDatasets();
    initVisualization();
    
  } catch (error) {
    console.error("Error loading data:", error);
    alert("Failed to load data. Check console for details.");
  } finally {
    showLoading(false);
  }
}

function mergeDatasets() {
  // Implementation depends on your specific CSV structures
  // Example merging logic:
  return state.completionData.map((compYear, i) => {
    const enrollYear = state.enrollmentData[i];
    return compYear.map(inst => {
      const enrollInst = enrollYear.find(e => e.UNITID === inst.UNITID);
      return {
        year: 2017 + i,
        unitid: inst.UNITID,
        name: inst.INSTNM,
        type: inst.CONTROL === '1' ? 'public' : 'private',
        completionRate: +inst.GRRTTOT,
        blackCompletion: +inst.GRRBKAAT,
        whiteCompletion: +inst.GRRWHITT,
        hispanicCompletion: +inst.GRRHISPT,
        totalEnrollment: +enrollInst?.EFTOTLT || 0,
        blackEnrollment: +enrollInst?.EFBKAAT || 0
      };
    });
  }).flat();
}

// Visualization rendering
function initVisualization() {
  updateScene();
  setupEventListeners();
}

function updateScene() {
  // Update UI
  d3.select("#scene-indicator").text(`Scene ${state.currentScene + 1} of ${scenes.length}`);
  d3.select("#header h1").text(scenes[state.currentScene].title);
  d3.select("#header p").text(scenes[state.currentScene].description);

  // Filter data based on current state
  const filteredData = filterData(state.mergedData);

  // Clear previous chart
  const svg = d3.select("#chart")
    .html("")
    .attr("width", 900)
    .attr("height", 500);

  // Render based on scene type
  switch(state.currentScene) {
    case 0:
      renderTrendChart(svg, filteredData);
      break;
    case 1:
      renderEquityChart(svg, filteredData);
      break;
    case 2:
      renderRecoveryChart(svg, filteredData);
      break;
    case 3:
      renderExploration(svg, filteredData);
      break;
  }
}

// Chart rendering functions
function renderTrendChart(svg, data) {
  // Group data by year for national averages
  const nested = d3.rollup(
    data,
    v => d3.mean(v, d => d.completionRate),
    d => d.year
  );

  const years = Array.from(nested.keys()).sort();
  const values = years.map(year => nested.get(year));

  // Scales
  const xScale = d3.scaleBand()
    .domain(years)
    .range([100, 800])
    .padding(0.2);

  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([400, 100]);

  // Line generator
  const line = d3.line()
    .x(d => xScale(d.year) + xScale.bandwidth()/2)
    .y(d => yScale(d.value));

  // Draw line
  svg.append("path")
    .datum(years.map((year, i) => ({ year, value: values[i] })))
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "#4CAF50")
    .attr("stroke-width", 3);

  // Add COVID annotation
  const annotations = [
    {
      note: { 
        title: "Pandemic Begins",
        label: "Completion rates dropped sharply in 2020" 
      },
      x: xScale(2020) + xScale.bandwidth()/2,
      y: yScale(nested.get(2020)),
      dy: -30,
      type: d3.annotationCalloutRect
    }
  ];

  svg.call(d3.annotation().annotations(annotations));

  // Add axes
  svg.append("g")
    .attr("transform", `translate(0, ${yScale(0)})`)
    .call(d3.axisBottom(xScale));

  svg.append("g")
    .attr("transform", "translate(100, 0)")
    .call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")));
}

// Additional render functions would go here
// function renderEquityChart() {...}
// function renderRecoveryChart() {...}
// function renderExploration() {...}

// Helper functions
function filterData(data) {
  return data.filter(d => 
    (state.institutionType === 'all' || d.type === state.institutionType) &&
    // Additional filters as needed
    true
  );
}

function showLoading(show) {
  d3.select("#loading").style("display", show ? "block" : "none");
  d3.select("#chart").style("opacity", show ? 0.5 : 1);
}

// Event listeners
function setupEventListeners() {
  d3.select("#prevBtn").on("click", () => {
    if (state.currentScene > 0) {
      state.currentScene--;
      updateScene();
    }
  });

  d3.select("#nextBtn").on("click", () => {
    if (state.currentScene < scenes.length - 1) {
      state.currentScene++;
      updateScene();
    }
  });

  d3.select("#institution-type").on("change", function() {
    state.institutionType = this.value;
    updateScene();
  });

  d3.select("#demographic").on("change", function() {
    state.demographic = this.value;
    updateScene();
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", loadData);
// script.js

// Central state object
const state = {
  completionData: [],
  enrollmentData: [],
  mergedData: []
};

// Show or hide a loading message
function showLoading(show) {
  const loading = document.getElementById("loading");
  if (loading) loading.style.display = show ? "block" : "none";
}

// Merge datasets (placeholder – adjust as needed)
function mergeDatasets() {
  // Simple example: flatten and add a "type" field
  const merged = [];

  state.completionData.forEach((dataset, index) => {
    dataset.forEach(d => {
      d.year = 2023 - index; // Assuming files are in reverse order
      d.source = "completions";
      merged.push(d);
    });
  });

  state.enrollmentData.forEach((dataset, index) => {
    dataset.forEach(d => {
      d.year = 2023 - index;
      d.source = "enrollment";
      merged.push(d);
    });
  });

  return merged;
}

// Load only 2023 first
async function loadData() {
  showLoading(true);
  try {
    const comp2023 = await d3.csv("college_data/c2023_b.csv");
    const enroll2023 = await d3.csv("college_data/ef2023a.csv");

    state.completionData = [comp2023];
    state.enrollmentData = [enroll2023];

    state.mergedData = mergeDatasets();
    initVisualization(); // First scene or chart

    // Load remaining data in background
    setTimeout(loadRemainingData, 100);

  } catch (error) {
    console.error("Error loading data:", error);
    alert("Failed to load data.");
  } finally {
    showLoading(false);
  }
}

// Load all remaining years
async function loadRemainingData() {
  const restCompletion = [
    "college_data/c2017_b_rv.csv",
    "college_data/c2018_b_rv.csv",
    "college_data/c2019_b_rv.csv",
    "college_data/c2020_b_rv.csv",
    "college_data/c2021_b_rv.csv",
    "college_data/c2022_b_rv.csv"
  ];
  const restEnrollment = [
    "college_data/ef2017a_rv.csv",
    "college_data/ef2018a_rv.csv",
    "college_data/ef2019a_rv.csv",
    "college_data/ef2020a_rv.csv",
    "college_data/ef2021a_rv.csv",
    "college_data/ef2022a_rv.csv"
  ];

  try {
    console.time("Loading older years");

    const compData = await Promise.all(restCompletion.map(f => d3.csv(f)));
    const enrollData = await Promise.all(restEnrollment.map(f => d3.csv(f)));

    // Put older years in front so data is sorted 2017 to 2023
    state.completionData.unshift(...compData.reverse());
    state.enrollmentData.unshift(...enrollData.reverse());

    state.mergedData = mergeDatasets();

    updateScene(); // Redraw chart with all years

    console.timeEnd("Loading older years");

  } catch (err) {
    console.warn("Problem loading historical data:", err);
  }
}

// Initial visualization (placeholder)
function initVisualization() {
  d3.select("#vis").append("p").text("✅ Data loaded for 2023. Waiting for all years…");

  // Here’s where you’ll build Scene 1: draw chart, annotate, etc.
}

// Called once all years are loaded
function updateScene() {
  d3.select("#vis").html(""); // Clear

  // Example: show data length
  d3.select("#vis")
    .append("p")
    .text(`✅ All years loaded. Merged rows: ${state.mergedData.length}`);

  // Add your full visualization or update logic here
}

// Load on DOM ready
document.addEventListener("DOMContentLoaded", loadData);

const state = { currentScene: 0, institutionType: 'all', demographic: 'all', completionData: [], enrollmentData: [], mergedData: [] };
const scenes = [
  { title: "National Completion Trends", description: "How graduation rates changed before, during, and after COVID-19", chartType: 'line' },
  { title: "Equity Gap Analysis", description: "Disparities in pandemic impacts by student demographics", chartType: 'bar' },
  { title: "Institutional Recovery", description: "Which schools bounced back fastest?", chartType: 'scatter' },
  { title: "Explore Your Institution", description: "Search for specific colleges", chartType: 'explore' }
];

async function loadData() {
  showLoading(true);
  try {
    const completionFiles = [
      'college_data/c2017_b_rv.csv', 'college_data/c2018_b_rv.csv',
      'college_data/c2019_b_rv.csv', 'college_data/c2020_b_rv.csv',
      'college_data/c2021_b_rv.csv', 'college_data/c2022_b_rv.csv',
      'college_data/c2023_b.csv'
    ];
    state.completionData = await Promise.all(completionFiles.map(f => d3.csv(f)));

    const enrollmentFiles = [
      'college_data/ef2017a_rv.csv', 'college_data/ef2018a_rv.csv',
      'college_data/ef2019a_rv.csv', 'college_data/ef2020a_rv.csv',
      'college_data/ef2021a_rv.csv', 'college_data/ef2022a_rv.csv',
      'college_data/ef2023a.csv'
    ];
    state.enrollmentData = await Promise.all(enrollmentFiles.map(f => d3.csv(f)));

    console.log('CSV loading done.');
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
  return state.completionData.flatMap((compYear, i) => {
    const enrollYear = state.enrollmentData[i] || [];
    return compYear.map(inst => {
      const year = 2017 + i;
      const enrollInst = enrollYear.find(e => e.UNITID === inst.UNITID) || {};
      return {
        year,
        unitid: inst.UNITID,
        name: inst.INSTNM,
        type: inst.CONTROL === '1' ? 'public' : 'private',
        completionRate: +inst.GRRTTOT || 0,
        blackCompletion: +inst.GRRBKAAT || 0,
        whiteCompletion: +inst.GRRWHITT || 0,
        hispanicCompletion: +inst.GRRHISPT || 0,
        totalEnrollment: +enrollInst.EFTOTLT || 0,
        blackEnrollment: +enrollInst.EFBKAAT || 0
      };
    });
  });
}

function initVisualization() {
  updateScene();
  setupEventListeners();
}

function updateScene() {
  d3.select("#scene-indicator").text(`Scene ${state.currentScene + 1} of ${scenes.length}`);
  d3.select("#header h1").text(scenes[state.currentScene].title);
  d3.select("#header p").text(scenes[state.currentScene].description);

  const filtered = filterData(state.mergedData);
  const svg = d3.select("#chart").html("").attr("width", 900).attr("height", 500);
  if (scenes[state.currentScene].chartType === 'line') renderTrendChart(svg, filtered);
}

function renderTrendChart(svg, data) {
  const nested = d3.rollup(data, v => d3.mean(v, d => d.completionRate), d => d.year);
  const years = [...nested.keys()].sort();
  const values = years.map(y => nested.get(y));

  const xScale = d3.scaleBand().domain(years).range([100, 800]).padding(0.2);
  const yScale = d3.scaleLinear().domain([0, d3.max(values)]).range([400, 100]);

  const lineGen = d3.line().x(d => xScale(d.year) + xScale.bandwidth()/2).y(d => yScale(d.value));
  svg.append("path").datum(years.map((y,i) => ({year: y, value: values[i]})))
    .attr("d", lineGen).attr("fill", "none").attr("stroke", "#4CAF50").attr("stroke-width", 3);

  const ann = [{
    note: {title: "Pandemic Begins", label: "Completion rates dropped sharply in 2020"},
    x: xScale(2020) + xScale.bandwidth()/2, y: yScale(nested.get(2020)), dy: -30, dx: 0,
    type: d3.annotationCalloutCircle
  }];
  svg.append("g").call(d3.annotation().annotations(ann));

  svg.append("g").attr("transform", `translate(0,${yScale(0)})`).call(d3.axisBottom(xScale));
  svg.append("g").attr("transform", "translate(100,0)").call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")));
}

function filterData(data) {
  return data.filter(d => (state.institutionType === 'all' || d.type === state.institutionType));
}

function showLoading(show) {
  d3.select("#loading").style("display", show ? "block" : "none");
  d3.select("#chart").style("opacity", show ? 0.4 : 1);
}

function setupEventListeners() {
  d3.select("#prevBtn").on("click", () => { state.currentScene = Math.max(0, state.currentScene - 1); updateScene(); });
  d3.select("#nextBtn").on("click", () => { state.currentScene = Math.min(scenes.length - 1, state.currentScene + 1); updateScene(); });
  d3.select("#institution-type").on("change", function() { state.institutionType = this.value; updateScene(); });
}

document.addEventListener("DOMContentLoaded", loadData);

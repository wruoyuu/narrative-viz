let allData, currentScene = 0;
const margin = { top:20, right:20, bottom:50, left:150 }, width=800-margin.left-margin.right, height=500-margin.top-margin.bottom;
let curInst="all", curDemo="all";

d3.csv("college_data/c2017_b_rv.csv").then(data => {
  allData = data;
  console.log("Loaded DATA samples:", allData.slice(0,3));
  updateScene();
});

d3.select("#institution-type").on("change", function() {
  curInst = this.value;
  console.log("Selected inst:", curInst);
  updateScene();
});
d3.select("#demographic").on("change", function() {
  curDemo = this.value;
  console.log("Selected demo:", curDemo);
  updateScene();
});

function filterData() {
  let d = allData;
  if (curInst === "public") d = d.filter(r => r.CONTROL === "1");
  else if (curInst === "private") d = d.filter(r => r.CONTROL === "2" || r.CONTROL === "3");
  console.log("After inst filter:", d.length, "rows");

  if (curDemo !== "all") {
    const map = { black:"CSBKAAT", hispanic:"CSHISPT", white:"CSWHITT", asian:"CSASIAW", native:"CSAIANT" };
    d = d.filter(r => +r[map[curDemo]] > 0);
    console.log("After demo filter:", d.length, "rows");
  }
  return d;
}

function drawScene1(data) {
  const svg = d3.select("#chart")
    .attr("width", width+margin.left+margin.right)
    .attr("height", height+margin.top+margin.bottom)
    .html("");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const keys = ["CSBKAAT","CSHISPT","CSWHITT","CSASIAW","CSAIANT"], labels = {
    CSBKAAT:"Black", CSHISPT:"Hisp", CSWHITT:"White", CSASIAW:"Asian", CSAIANT:"Native"
  };
  const showKeys = curDemo==="all"? keys : [keys[keys.indexOf({"black":"CSBKAAT","hispanic":"CSHISPT","white":"CSWHITT","asian":"CSASIAW","native":"CSAIANT"}[curDemo])]];
  
  const comp = showKeys.map(k=>({
    race: labels[k], total: d3.sum(data, r => +r[k] || 0)
  }));
  console.log("Data totals:", comp);

  const x = d3.scaleLinear().domain([0,d3.max(comp, d=>d.total)||10]).range([0,width]);
  const y = d3.scaleBand().domain(comp.map(d=>d.race)).range([0,height]).padding(0.2);

  g.selectAll("rect").data(comp).enter()
    .append("rect")
    .attr("y", d=>y(d.race)).attr("width", d=>x(d.total)).attr("height", y.bandwidth())
    .attr("fill","#5b9bd5");

  g.append("g").call(d3.axisLeft(y));
  g.append("g").attr("transform",`translate(0,${height})`).call(d3.axisBottom(x));
}

function updateScene() {
  if (!allData) return;
  const filtered = filterData();
  drawScene1(filtered);
}

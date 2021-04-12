/********************************************************/

const datafile = "./data.csv";

/********************************************************/

// Define SVG area dimensions
const svgWidth = 960;
const svgHeight = 660;

/********************************************************/
// Define the chart's margins as an object
const chartMargin = 
{
  top: 30,
  right: 40,
  bottom: 80,
  left: 50,
};

/********************************************************/
// Define dimensions of the chart area
const chartWidth = svgWidth - chartMargin.left - chartMargin.right;
const chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

/***************** Add svg tag/area to HTML *************************/

// Select body, append SVG area to it, and set the dimensions
const svg = d3
  .select("body")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

/********************************************************/

const chartGroup = svg
  .append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

/********************************************************/
d3.csv(datafile, rowUpdate)
  .then(createChart)
  .catch(function (error) 
  {
    console.log(error);
  });

/************** Parse & Clean data from CSV *****************/
//this is the first step that interacts with your data
function rowUpdate(row) //convert CSVtext into appropriate formats 
{
  var parseTime = d3.timeParse("%d-%b-%Y");
  row.dow_index = +row.dow_index; //convert the text value to int
  row.smurf_sightings = +row.smurf_sightings; //convert the text value to int
  row.date = parseTime(row.date);
  return row;
}
/***************** Create a Function to calculate and add your chart to HTML ***********************/
function createChart(data) {
  console.table(data, ["date", "dow_index", "smurf_sightings"]);

  /************** Create your scales ************/
  let ydow_indexScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.dow_index)])
    .range([chartHeight, 0]);

  let ysmurf_sightingsScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.smurf_sightings)])
    .range([chartHeight, 0]);

  //both y uses the same date values so only one x is needed
  let xTimeScale = d3 
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([0, chartWidth]);
  // .paddingInner(0.1)
  // .paddingOuter(0.2); //talk about xScale.step

  /************** Create your axis ************/
  let bottomAxis = d3.axisBottom(xTimeScale).tickFormat(d3.timeFormat("%d-%b-%Y"));
  // let topAxis = d3.axisTop(xScale);
  let leftAxis = d3.axisLeft(ydow_indexScale).ticks(10);
  let rightAxis = d3.axisRight(ysmurf_sightingsScale).ticks(10);

  /************** Add the axis to your HTML ************/
  chartGroup
    .append("g")
    .call(rightAxis)
    .classed("axis", true)
    .attr("transform", `translate(${chartWidth},${0})`)
    .attr("font-size", "12px")
    .attr("color", "green");

  chartGroup
    .append("g")
    .call(leftAxis)
    .classed("axis", true)
    .attr("font-size", "12px")
    .attr("color", "blue");
  // chartGroup.append("g").call(topAxis);

  chartGroup
    .append("g")
    .call(bottomAxis)
    .attr("transform", `translate(0, ${chartHeight})`)
    .classed("axis", true);

  /************** Create your line info ************/
  var linedow_index = d3
    .line()
    .x((d) => xTimeScale(d.date))
    .y((d) => ydow_indexScale(d.dow_index));

  var linesmurf_sightings = d3
    .line()
    .x((d) => xTimeScale(d.date))
    .y((d) => ysmurf_sightingsScale(d.smurf_sightings));

  /************** Add the line to your HTML ************/
  chartGroup
    .append("path")
    .classed("line green", true) // make sure the class matches your style sheet
    .attr("d", linedow_index(data));

  chartGroup
    .append("path")
    .classed("line blue", true) // make sure the class matches your style sheet
    .attr("d", linesmurf_sightings(data));

  /************* Add labels & styles to chart **************/
  chartGroup
    .append("text")
    .text("Dow Index Level")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + chartMargin.top + 20)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("fill", "green")


  chartGroup
    .append("text")
    .text("Smurf Sightings")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + chartMargin.top + 40)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("fill", "blue")

    /************* Add data points to line **************/
  chartGroup
  .selectAll(".dow_indexcircle") //select all of the class
  .data(data) //bind data
  .enter() //grab any extra data
  .append("circle") //append a circle for those extras
  .classed("dow_indexcircle", true)
  .attr("cx", (d)=> xTimeScale(d.date))
  .attr("cy", (d)=> ydow_indexScale(d.dow_index))
  .attr("r", 3)

chartGroup
  .selectAll(".smurf_sightingscircle") //select all of the class
  .data(data) //bind data
  .enter() //grab any extra data
  .append("circle") //append a circle for those extras
  .classed("smurf_sightingscircle", true)
  .attr("cx", (d)=> xTimeScale(d.date))
  .attr("cy", (d)=> ysmurf_sightingsScale(d.smurf_sightings))
  .attr("r", 3)

/************* Add tooltip div to HTML **************/
let toolTip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip");

/************* Add event listeners to show/hide tooltips **************/
d3.selectAll('circle')
  .on("mouseover", showToolTip)
  .on("mouseout", hidetooltip)

  /************* define functions for  event **************/

  function hidetooltip() 
  {
    toolTip.style("display", "none"); 
    // w/o this function the box will display
    // until another tooltip is activated
  }

  function showToolTip(event, d) 
  {
    let circle = d3.select(this);

    let classname = circle.attr("class");
    console.log(classname);

    if (classname === "dow_indexcircle") 
    {
      toolTip.style("background", "green").style("color", "white");
    } 
    else 
    {
      toolTip.style("background", "blue");
    }

    toolTip.style("display", "block");

    let html = `dow_index :<strong> ${d.dow_index}</strong> <br>
      smurf_sightings: <strong>  ${d.smurf_sightings} </strong> `;

    toolTip
      .html(html)
      .style("left", event.pageX + "px")
      .style("top", event.pageY + "px");
  }   
}
/********************************************************/

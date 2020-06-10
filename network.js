const margin = {
  top: 3,
  bottom: 3,
  left: 10,
  right: 10,
};

const width = document.getElementById('slide1').offsetWidth; - margin.left - margin.right;
const height = document.getElementById('slide1').offsetHeight; - margin.top - margin.bottom;

const svg = d3
  .select("#network_graph")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

const simulation = d3
  .forceSimulation()
  .force("link", d3.forceLink()
    .id((d) => d.subsection_id)
    .distance((d) => (0.5/d.weight) ))
  .force("charge", d3.forceManyBody()
    .strength((d) => -30 + (d.weight * 10) ))
  .force("center", d3.forceCenter(width / 2, height / 2))

const color = d3.scaleOrdinal(d3.schemeSet3);

d3.json("json/1980.json").then((data) => {
  // Links data join
  const link = svg.selectAll(".link")
    .data(data.links)
    .join((enter) => enter
      .append("line")
      .attr("class", "link"));

  link.append("title")
    .text(d => d.weight)
    .attr("fill", "white");

  // create a tooltip
  // -1- Create a tooltip div that is hidden by default:
  const tooltip = d3
    .select("#network_graph")
    .append("div")
      .style("opacity", 0.5)
      .attr("class", "tooltip");

  // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
  const showTooltip = function(d) {
    tooltip
      .transition()
      .duration(200)
    tooltip
      .style("opacity", 1)
      .html(d.description)
      .style("left", (d3.mouse(this)[0]+30) + "px")
      .style("top", (d3.mouse(this)[1]+30) + "px")
  }
  const moveTooltip = function(d) {
    tooltip
      .style("left", (d3.mouse(this)[0]+30) + "px")
      .style("top", (d3.mouse(this)[1]+30) + "px")
  }
  const hideTooltip = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }

  // Nodes data join
  const node = svg.selectAll(".node")
    .data(data.nodes)
    .join((enter) => {
      const node_enter = enter
      .append("circle")
        .attr("class", "node")
        .attr("r", (d) => d.frequency / 150)
      .on("mouseover", showTooltip )
      .on("mousemove", moveTooltip )
      .on("mouseleave", hideTooltip )
      .call(d3.drag() //sets the event listener for the specified typenames and returns the drag behavior.
        .on("start", dragstarted) //start - after a new pointer becomes active (on mousedown or touchstart).
        .on("drag", dragged)); //drag - after an active pointer moves (on mousemove or touchmove).
      return node_enter;
    });

  const text = svg.selectAll(".texts")
    .data(data.nodes)
    .enter()
    .append("text")
    .attr("dx", 0)
    .attr("dy", "0.35em")
    .text(function(d){ return d.subsection_id; });

  node.style("fill", (d) => color(d.section_id));
  text.style("fill", (d) => color(d.section_id));

  function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();//sets the current target alpha to the specified number in the range [0,1].
      d.fy = d.y; //fx - the node’s fixed x-position. Original is null.
      d.fx = d.x; //fy - the node’s fixed y-position. Original is null.
  }

  //When the drag gesture starts, the targeted node is fixed to the pointer
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  simulation.nodes(data.nodes).force("link").links(data.links);

  simulation.on("tick", (e) => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    text.attr("x", (d) => d.x).attr("y", (d) => d.y);
  });

  //legend
  var sequentialScale = d3.scaleOrdinal(d3.schemeSet2)
  .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  var legendSequential = d3.legendColor()
      .shapeWidth(30)
      .cells(11)
      .orient("vertical")
      .title("Group number by color:")
      .titleWidth(100)
      .scale(sequentialScale)

  svg.select(".legendSequential")
    .call(legendSequential);

  // A slider (using only d3 and HTML5) that removes nodes below the input threshold.
  // const slider = d3.select('body').append('p').text('Year: ');
  //
  // slider.append('label')
  // .attr('for', 'threshold')
  // .text('1980');
  //
  // slider.append('input')
  //   .attr('type', 'range')
  //   .attr('min', 1980)
  //   .attr('max', 1990)
  //   .attr('value')
  //   .attr('id', 'threshold')
  // .style('width', '50%')
  // .style('display', 'block')
  // .on('input', function () {
  //   var year = this.value;
  //
  //   d3.select('label').text(year);

    // // Find the links that are at or above the threshold.
    // var newData = [];
    // graph.links.forEach( function (d) {
    //   if (d.weight >= threshold) {newData.push(d); };
    // });
    //
    // // Data join with only those new links.
    // link = link.data(newData, function(d) {return d.source + ', ' + d.target;});
    // link.exit().remove();
    // var linkEnter = link.enter().append('line').attr('class', 'link');
    // link = linkEnter.merge(link);
    //
    // node = node.data(graph.nodes);
    //
    // // Restart simulation with new link data.
    // simulation
    //   .nodes(graph.nodes).on('tick', ticked)
    //   .force("link").links(newData);
    //
    // simulation.alphaTarget(0.1).restart();

  // });
});

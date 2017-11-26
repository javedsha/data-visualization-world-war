function createBarChart(filePath) {
  var svg = d3.select("svg"),
    margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
  // var y = d3.scaleLinear().rangeRound([height, 0]);
  var y = d3.scaleLog().rangeRound([height, 0]);

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv(filePath, function (d) {
    d.Deaths = +d.Deaths;
    return d;
  }, function (error, data) {
    if (error) throw error;

    var format = function (d) {
      return d3.format(".2s")(d);
    }

    x.domain(data.map(function (d) { return d.GeoCode; }));
    //y.domain([0, d3.max(data, function(d) { return d.Deaths; })]);
    y.domain([50, d3.max(data, function (d) { return d.Deaths; })]);

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function (d) {
        return `<span>` + d.Nationality + `</span>` + `, ` + `<span style='color:red'>` + format(d.Deaths) + `</span>`;
      });

    svg.call(tip);

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(20, d3.format(".2s")))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Death Count");

    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d) { return x(d.GeoCode); })
      .attr("y", function (d) { return y(d.Deaths); })
      .attr("width", x.bandwidth())
      .attr("height", function (d) { return height - y(d.Deaths); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
  });

  // handle on click event
  d3.select("#bar-select")
    .on("change", function () {
      var newData = d3.select(this).property('value');

      if (newData === "WorldWarI") {
        $('.dv-title').text("World War I");
        d3.select("svg").remove();
        d3.select(".visualization-main").append("svg").attr("width", "980").attr("height", "500");
        createBarChart("http://localhost:8888/data/WW1DeathsCountTotalByCountry.csv");
      } else {
        $('.dv-title').text("World War II");
        d3.select("svg").remove();
        d3.select(".visualization-main").append("svg").attr("width", "1480").attr("height", "500");
        createBarChart("http://localhost:8888/data/WW2DeathsCountTotalByCountry.csv");
      }
    });

}

createBarChart("http://localhost:8888/data/WW1DeathsCountTotalByCountry.csv");
function compareWars() {
    var svg = d3.select("svg"),
        margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    var y = d3.scaleLinear().rangeRound([height, 0]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("http://localhost:8888/data/CompareWars.csv", function (d) {
        d.Deaths = +d.Deaths;
        return d;
    }, function (error, data) {
        if (error) throw error;

        var format = function (d) {
            return d3.format("s")(d);
        }

        x.domain(data.map(function (d) { return d.War; }));
        y.domain([10000000, 70000000]);

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                return `<span>` + d.War + `</span>` + `, ` + `<span style='color:red'>` + format(d.Deaths) + `</span>`;
            });

        svg.call(tip);

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(5, d3.format("s")))
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
            .attr("x", function (d) { return x(d.War); })
            .attr("y", function (d) { return y(d.Deaths); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return height - y(d.Deaths); })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    });
}

compareWars();
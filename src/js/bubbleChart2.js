function createBubbleChart(filePath) {
    var svg = d3.select("svg"),
        width = +svg.attr("width");

    var format = function (d) {
        return d3.format('.2s')(d);
    }

    var color = d3.scaleOrdinal(d3.schemeCategory20c);

    d3.csv(filePath, function (d) {
        d.Deaths = +d.Deaths;
        if (d.Deaths) return d;
    }, function (error, data) {
        if (error) throw error;

        var root = d3.hierarchy({ children: data })
            .sum(function (d) { return d.Deaths; })
            .each(function (d) {
                if (id = d.data.Nationality) {
                    var id, i = id.lastIndexOf(".");
                    d.id = id;
                    d.package = id.slice(0, i);
                    d.class = d.data.GeoCode;
                }
            });

        var pack = d3.pack()
            .size([width, width])
            .padding(1.5);

        var node = svg.selectAll(".node")
            .data(pack(root).leaves())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

        node.append("circle")
            .attr("id", function (d) { return d.id; })
            .attr("r", function (d) { return d.r; })
            .style("fill", function (d) { return color(d.package); });

        node.append("clipPath")
            .attr("id", function (d) { return "clip-" + d.id; })
            .append("use")
            .attr("xlink:href", function (d) { return "#" + d.id; });

        node.append("text")
            .attr("clip-path", function (d) { return "url(#clip-" + d.id + ")"; })
            .selectAll("tspan")
            .data(function (d) { return d.class.split(/(?=[A-Z][^A-Z])/g); })
            .enter().append("tspan")
            .attr("x", 0)
            .attr("y", function (d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
            .text(function (d) { return d; });

        node.append("title")
            .text(function (d) { return d.id + "\n" + format(d.value); });
    });

    // handle on click event
    d3.select("#bubble-select")
        .on("change", function () {
            var newData = d3.select(this).property('value');

            if (newData === "WorldWarI") {
                $('.dv-title').text("World War I");
                d3.select("svg").remove();
                d3.select(".visualization-main").append("svg").attr("width", "600").attr("height", "600");
                createBubbleChart("http://localhost:8888/data/WW1DeathsCountTotalByCountry.csv");
            } else {
                $('.dv-title').text("World War II");
                d3.select("svg").remove();
                d3.select(".visualization-main").append("svg").attr("width", "600").attr("height", "600");
                createBubbleChart("http://localhost:8888/data/WW2DeathsCountTotalByCountry.csv");
            }
        });
}

createBubbleChart("http://localhost:8888/data/WW1DeathsCountTotalByCountry.csv");
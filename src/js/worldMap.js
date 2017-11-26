function drawMap(filePath) {
    var format = function (d) {
        return d3.format('.2s')(d);
    }

    var map = d3.geomap.choropleth()
        .geofile("http://localhost:8888/data/topojson/world/countries.json")
        .colors(colorbrewer.YlOrRd[5])
        .column("Deaths")
        .format(format)
        .legend(true)
        .zoomFactor(3)
        .duration(2000)
        .unitId("GeoCode");

    d3.csv(filePath, function (error, data) {
        d3.select('#map')
            .datum(data)
            .call(map.draw, map);
    });

    // handle on click event
    d3.select("#map-select")
        .on("change", function () {
            var newData = d3.select(this).property('value');

            if (newData === "WorldWarI") {
                $('.dv-title').text("World War I");
                d3.select("svg").remove();
                //d3.select(".visualization-main").append("svg").attr("width", "600").attr("height", "600");
                drawMap("http://localhost:8888/data/WW1DeathsCountTotalByCountry.csv");
            } else {
                $('.dv-title').text("World War II");
                d3.select("svg").remove();
                //d3.select(".visualization-main").append("svg").attr("width", "600").attr("height", "600");
                drawMap("http://localhost:8888/data/WW2DeathsCountTotalByCountry.csv");
            }
        });
}

drawMap("http://localhost:8888/data/WW1DeathsCountTotalByCountry.csv");
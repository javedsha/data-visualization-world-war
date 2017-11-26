function createBubbleChart() {
    function bubbleChart() {
        // Constants for sizing
        var width = 940;
        var height = 600;

        // tooltip for mouseover functionality
        var tooltip = floatingTooltip("worldwar2_tooltip", 240);

        // Locations to move bubbles towards, depending
        // on which view mode is selected.
        var center = { x: width / 2, y: height / 2 };

        // @v4 strength to apply to the position forces
        var forceStrength = 0.03;

        // These will be set in create_nodes and create_vis
        var svg = null;
        var bubbles = null;
        var nodes = [];

        function charge(d) {
            return -Math.pow(d.radius, 2.0) * forceStrength;
        }

        var simulation = d3.forceSimulation()
            .velocityDecay(0.2)
            .force('x', d3.forceX().strength(forceStrength).x(center.x))
            .force('y', d3.forceY().strength(forceStrength).y(center.y))
            .force('charge', d3.forceManyBody().strength(charge))
            .on('tick', ticked);

        simulation.stop();

        var fillColor = d3.scaleOrdinal(d3.schemeCategory20c);

        /*
         * This data manipulation function takes the raw data from
         * the CSV file and converts it into an array of node objects.
         * Each node will store data and visualization values to visualize
         * a bubble.
         *
         * rawData is expected to be an array of data objects, read in from
         * one of d3's loading functions like d3.csv.
         *
         * This function returns the new node array, with a node in that
         * array for each element in the rawData input.
         */
        function createNodes(rawData) {
            // Use the max total_amount in the data as the max in the scale's domain
            // note we have to ensure the total_amount is a number.
            var maxDeaths = d3.max(rawData, function (d) { return +d.Deaths; });

            // Sizes bubbles based on area.
            // @v4: new flattened scale names.
            var radiusScale = d3.scalePow()
                .exponent(0.5)
                .range([10, 100])
                .domain([0, maxDeaths]);

            // Use map() to convert raw data into node data.
            // Checkout http://learnjsdata.com/ for more on
            // working with data.
            var myNodes = rawData.map(function (d) {
                return {
                    id: d.Nationality,
                    radius: radiusScale(+d.Deaths),
                    value: +d.Deaths,
                    text: d.GeoCode,
                    x: Math.random() * 900,
                    y: Math.random() * 800
                };
            });

            // sort them to prevent occlusion of smaller nodes.
            myNodes.sort(function (a, b) { return b.value - a.value; });

            return myNodes;
        }

        /*
         * Main entry point to the bubble chart. This function is returned
         * by the parent closure. It prepares the rawData for visualization
         * and adds an svg element to the provided selector and starts the
         * visualization creation process.
         *
         * selector is expected to be a DOM element or CSS selector that
         * points to the parent element of the bubble chart. Inside this
         * element, the code will add the SVG continer for the visualization.
         *
         * rawData is expected to be an array of data objects as provided by
         * a d3 loading function like d3.csv.
         */
        var chart = function chart(selector, rawData) {
            // convert raw data into nodes data
            nodes = createNodes(rawData);

            // Create a SVG element inside the provided selector
            // with desired size.
            svg = d3.select(selector)
                .append('svg')
                .attr('width', width)
                .attr('height', height);

            // Bind nodes data to what will become DOM elements to represent them.
            bubbles = svg.selectAll('.bubble')
                .data(nodes, function (d) { return d.id; })
                .enter().append("g")
                .attr("class", "bubble-g")
                .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

            // Create new circle elements each with class `bubble`.
            // There will be one circle.bubble for each object in the nodes array.
            // Initially, their radius (r attribute) will be 0.
            // @v4 Selections are immutable, so lets capture the
            //  enter selection to apply our transtition to below.
            var bubblesE = bubbles.append('circle')
                .classed('bubble', true)
                .attr('r', function (d) { return d.radius; })
                .attr('fill', function (d) { return fillColor(d.value); })
                .attr('stroke', function (d) { return d3.rgb(fillColor(d.value)).darker(); })
                .attr('stroke-width', 2)
                .on('mouseover', showDetail)
                .on('mouseout', hideDetail);

            bubblesE.append("clipPath")
                .attr("id", function (d) { return "clip-" + d.text; })
                .append("use")
                .attr("xlink:href", function (d) { return "#" + d.text; });


            bubblesE.append("text")
                .attr("clip-path", function (d) { return "url(#clip-" + d.text + ")"; })
                .selectAll("tspan")
                .data(function (d) { return d.text.split(/(?=[A-Z][^A-Z])/g); })
                .enter().append("tspan")
                .attr("x", 0)
                .attr("y", function (d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
                .text(function (d) { return d; });

            // @v4 Merge the original empty selection and the enter selection
            bubbles = bubbles.merge(bubblesE);

            // Fancy transition to make bubbles appear, ending with the
            // correct radius
            bubbles.transition()
                .duration(2000)
                .attr('r', function (d) { return d.radius; });

            // Set the simulation's nodes to our newly created nodes array.
            // @v4 Once we set the nodes, the simulation will start running automatically!
            simulation.nodes(nodes);

            // Set initial layout to single group.
            groupBubbles();
        };

        function getColorSetting(value) {
            var setting = null;

            if (value <= 100000) {
                setting = "low";
            } else if (value > 100000 && value <= 1000000) {
                setting = "medium";
            } else if (value > 1000000) {
                setting = "high";
            }

            return setting;
        }

        /*
         * Callback function that is called after every tick of the
         * force simulation.
         * Here we do the acutal repositioning of the SVG circles
         * based on the current x and y values of their bound node data.
         * These x and y values are modified by the force simulation.
         */
        function ticked() {
            bubbles
                .attr('cx', function (d) { return d.x; })
                .attr('cy', function (d) { return d.y; });
        }


        /*
         * Sets visualization in "single group mode".
         * The year labels are hidden and the force layout
         * tick function is set to move all nodes to the
         * center of the visualization.
         */
        function groupBubbles() {
            // @v4 Reset the 'x' force to draw the bubbles to the center.
            simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));

            // @v4 We can reset the alpha value and restart the simulation
            simulation.alpha(1).restart();
        }

        /*
         * Function called on mouseover to display the
         * details of a bubble in the tooltip.
         */
        function showDetail(d) {
            // change outline to indicate hover state.
            d3.select(this).attr('stroke', 'black');

            var content = '<span class="name">Country: </span><span class="value">' +
                d.id +
                '</span><br/>' +
                '<span class="name">Deaths: </span><span class="value">' +
                d.value +
                '</span>';

            tooltip.showTooltip(content, d3.event);
        }

        /*
         * Hides tooltip
         */
        function hideDetail(d) {
            // reset outline
            d3.select(this)
                .attr('stroke', d3.rgb(fillColor(d.value)).darker());

            tooltip.hideTooltip();
        }

        // return the chart function from closure.
        return chart;
    }

    /*
     * Below is the initialization code as well as some helper functions
     * to create a new bubble chart instance, load the data, and display it.
     */

    var myBubbleChart = bubbleChart();

    /*
     * Function called once data is loaded from CSV.
     * Calls bubble chart function to display inside #vis div.
     */
    function display(error, data) {
        if (error) {
            console.log(error);
        }

        myBubbleChart(".visualization-main", data);
    }

    // Load the data.
    d3.csv("http://localhost:8888/data/WW2DeathsCountTotalByCountry.csv", display);

}

createBubbleChart();
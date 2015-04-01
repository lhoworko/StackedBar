var Chart = function(task_type, system_type) {
    this.task_type = task_type;
    this.system_type = system_type;

    var options = new this.options();

    this.createStackedChart(this.system_type, options);
}

Chart.prototype.options = function() {
    this.margin = {top: 20, right: 30, bottom: 40, left: 50};
    this.width = 600 - this.margin.left - this.margin.right;
    this.height = 350 - this.margin.top - this.margin.bottom;

    this.y = d3.scale.ordinal()
        .rangeRoundBands([this.height, 0], .1);

    this.x = d3.scale.linear()
        .rangeRound([0, this.width]);

    this.color = d3.scale.ordinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
}

Chart.prototype.createStackedChart = function(chart_type, options) {
    var x = options.x;
    var y = options.y;

    var xAxis = d3.svg.axis()
        .scale(options.x)
        .orient("bottom")
        .tickFormat(d3.format('.2s'));

    var yAxis = d3.svg.axis()
        .scale(options.y)
        .orient("left");

    var svg = d3.select("div#chart_display").append("svg")
        .attr("width", options.width + options.margin.left + options.margin.right)
        .attr("height", options.height + options.margin.top + options.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");

    d3.csv('data.csv', function(data) {
        options.color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Company"; }));

        data.forEach(function(d) {
            var x0 = 0;
            d.values = options.color.domain().map(function(name) { return {name: name, x0: x0, x1: x0 += +d[name]}; });
            d.total = d.values[d.values.length - 1].x1;
        });

        data.sort(function(a, b) { return b.total - a.total; });

        y.domain(data.map(function(d) { return d.Company; }));
        x.domain([0, d3.max(data, function(d) { return d.total; })]);

        var company = svg.selectAll(".company")
            .data(data)
            .enter().append("g")
            .attr("class", "g company")
            .attr('id', function(d) { return d.Company; })
            .attr("transform", function(d) { return "translate(0," + options.y(d.Company) + ")"; });

        company.selectAll("rect")
            .data(function(d) { return d.values; })
            .enter().append("rect")
            .attr("height", options.y.rangeBand())
            .attr("x", function(d) { return options.x(d.x0); })
            .attr("width", function(d) { return options.x(d.x1) - options.x(d.x0); })
            .style("fill", function(d) { return options.color(d.name); });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + options.height + ")")
            .call(xAxis)
            .append("text")
            .attr("transform", "translate(" + options.width + ",0)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Population");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        /*var legend = svg.selectAll(".legend")
            .data(color.domain().slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });*/
    });
}

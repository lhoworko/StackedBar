var Chart = function(data) {
    var options = this.options = this.createOptions(data);
    this.data = data;
}

Chart.prototype.createOptions = function() {
    var options = {};

    options.margin = {top: 20, right: 30, bottom: 40, left: 50};
    options.width = 600 - options.margin.left - options.margin.right;
    options.height = 350 - options.margin.top - options.margin.bottom;

    options.y = d3.scale.ordinal()
        .rangeRoundBands([options.height, 0], .1);

    options.x = d3.scale.linear()
        .rangeRound([0, options.width]);

    options.xx = [];
    for (var i = 0; i < 6; i++) {
        options.xx.push(d3.scale.linear()
            .rangeRound([0, options.width / 6]));
    }

    options.color = d3.scale.ordinal()
        .domain(d3.keys(data[0]).filter(function(key) { return key !== "Company"; }))
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c"]);

    return options;
}

Chart.prototype.newChart = function(system_type, task_type, count) {
    var options = this.options;
    var data = [
        this.data[data_order[count * 2]],
        this.data[data_order[count * 2 + 1]]
    ];

    var x = options.x;
    var y = options.y;

    data.forEach(function(d) {
        var x0 = 0;

        d.values = options.color.domain().map(function(name) {
            return { name: name, x0: x0, x1: x0 += +d[name] };
        });

        d.total = d.values[d.values.length - 1].x1;
    });

    var xx = options.xx;

    for (var i = 0; i < 6; i++) {
        xx[i].domain([0, d3.max(
            data, function(d) { return d.values[i].x1 - d.values[i].x0; }
        )]);
    }

    data.forEach(function(d) {
        var shift = 0;

        for (var i = 0; i < 6; i++) {
            d.values[i].shift = shift;
            shift += xx[i](d.values[i].x1 - d.values[i].x0);
        }
    });

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
        .attr("x", function(d, i) {
            return d.shift;
        })
        .attr("width", function(d, i) { return xx[i](d.x1 - d.x0) })
        .style("fill", function(d) { return options.color(d.name); });

    company.on('click', function() {
        answerQuestion(this.id);
    });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + options.height + ")")
        .call(xAxis);

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
}

var Chart = function(data) {
    var options = this.options = this.createOptions(data);
    this.data = data;
}

function shouldInvert(system_type, attribute) {
    if ((system_type == 1 || system_type == 2) && invert.indexOf(attribute) > -1)
        return true;
    return false;
}

Chart.prototype.createOptions = function() {
    var options = {};

    options.margin = {top: 20, right: 30, bottom: 40, left: 50};
    options.width = 600 - options.margin.left - options.margin.right;
    options.height = 350 - options.margin.top - options.margin.bottom;

    options.y = d3.scale.ordinal()
        .rangeRoundBands([options.height, 0], .1);

    options.x = d3.scale.linear();
    options.x2 = d3.scale.linear();
        /*.domain([0, 1])
        .rangeRound([0, options.width]);*/

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

    data.forEach(function(d) {
        var x0 = 0;

        if (system_type == 1 || system_type == 2) {
            // Need to invert some values.
            for (a in invert) {
                if (d[invert[a]] == 0) {
                    d[invert[a]] = 0.0001;
                }
                d[invert[a]] = 1 / d[invert[a]];
            }
        }

        d.values = options.color.domain().map(function(name) {
            return { name: name, x0: x0, x1: x0 += +d[name] };
        });

        d.total = d.values[d.values.length - 1].x1;
    });

    var xx = options.xx;

    for (var i = 0; i < 6; i++) {
        xx[i].domain([-0.1, d3.max(
            data, function(d) { return d.values[i].x1 - d.values[i].x0; }
        ) + 0.1]);
    }

    if (system_type == 0 || system_type == 1) { // Normal stacked bar or with inversion
        data.forEach(function(d) {
            var shift = 0;

            for (var i = 0; i < 6; i++) {
                d.values[i].shift = shift;
                shift += xx[i](d.values[i].x1 - d.values[i].x0);
            }
        });
    } else if (system_type == 2) {  // Diverging stacked bar with inversion
        data.forEach(function(d) {
            var shift = options.width / 2;

            for (var i = 0; i < 3; i++) {
                // first 3 on right
                d.values[i].shift = shift;
                shift += xx[i](d.values[i].x1 - d.values[i].x0);
            }

            shift = options.width / 2;

            for (var i = 5; i > 2; i--) {
                // 2nd 3 on left.
                shift -= xx[i](d.values[i].x1 - d.values[i].x0);
                d.values[i].shift = shift;
            }
        });
    }

    if (system_type == 2) {
        options.x
            .domain([0, 0.5])
            .rangeRound([0, options.width / 2]);

        options.x2
            .domain([0.5, 0])
            .rangeRound([0, options.width / 2]);
    } else {
        options.x
            .domain([0, 1])
            .rangeRound([0, options.width]);
    }

    var xAxis = d3.svg.axis()
        .scale(options.x)
        .orient("bottom")
        .ticks(system_type == 2 ? 5 : 10);

    var yAxis = d3.svg.axis()
        .scale(options.y)
        .orient("left");

    var xAxis2;

    if (system_type == 2) {
        xAxis2 = d3.svg.axis()
            .scale(options.x2)
            .orient('bottom')
            .ticks(5);
    }

    var svg = d3.select("div#chart_display").append("svg")
        .attr("width", options.width + options.margin.left + options.margin.right)
        .attr("height", options.height + options.margin.top + options.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");

    options.y.domain(data.map(function(d) { return d.Company; }));

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
        .style("fill", function(d) {
            return options.color(d.name);
        })
        .style('stroke', function(d) {
            if (shouldInvert(system_type, d.name)) {
                return 'black';
            }
            return options.color(d.name);
        })
        .style('stroke-width', 2);

    company.on('click', function() {
        answerQuestion(this.id);
    });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", function() {
            if (system_type == 2) {
                return "translate(" + options.width / 2 + "," + options.height + ")";
            }
            return "translate(0," + options.height + ")";
        })
        .call(xAxis);

    if (system_type == 2) {
        svg.append("g")
            .attr("class", "x2 axis")
            .attr("transform", function() {
                return "translate(0," + options.height + ")";
            })
            .call(xAxis2);

        // insert vertical line at center
        svg.append('path')
            .attr('id', 'midAxis')
            .attr('d', 'M' + options.width / 2 + ' 0 V' + options.height);

    }

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

        console.log(data);

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

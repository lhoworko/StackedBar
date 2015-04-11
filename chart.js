var Chart = function(data) {
    this.data = data;

    this.margin3 = {top: 20, right: 30, bottom: 40, left: 50};
    this.width = 600 - this.margin3.left - this.margin3.right;
    this.height = 350 - this.margin3.top - this.margin3.bottom;

    this.colors = d3.scale.category10()
        .domain(d3.keys(data[0]).filter(function(key) { return key !== "Company"; }));

    this.x3 = [];
    for (var i = 0; i < 6; i++) {
        this.x3.push(d3.scale.linear().rangeRound([0, this.width / 6]));
    }

    this.y3 = d3.scale.ordinal()
        .rangeRoundBands([this.height, 0], 0.1);

    this.svg = d3.select("div#chart_display").append("svg")
        .attr("width", this.width + this.margin3.left + this.margin3.right)
        .attr("height", this.height + this.margin3.top + this.margin3.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin3.left + "," + this.margin3.top + ")");

    this.yAxis = d3.svg.axis()
        .orient("left");

    this.yAxis_display = this.svg.append("g")
        .attr("class", "y axis");

}

Chart.prototype.updateChart = function(system, task, count) {
    var t = this;

    var data = [
        this.data[count * 2],
        this.data[count * 2 + 1]
    ];

    data.forEach(function(d) {
        var x0 = 0;

        if (system == 1 || system == 2) {
            // Need to invert some values.
            for (a in invert) {
                if (d[invert[a]] == 0) {
                    d[invert[a]] = 0.0001;
                }
                d[invert[a]] = 1 / d[invert[a]];
            }
        }

        d.values = t.colors.domain().map(function(name) {
            return { name: name, x0: x0, x1: x0 += +d[name] };
        });

        d.total = d.values[d.values.length - 1].x1;
    });

    for (var i = 0; i < 6; i++) {
        t.x3[i].domain([-0.1, d3.max(
            data, function(d) { return d.values[i].x1 - d.values[i].x0; }
        ) + 0.1]);
    }

    if (system == 0 || system == 1) { // Normal stacked bar or with inversion
        data.forEach(function(d) {
            var shift = 0;

            for (var i = 0; i < 6; i++) {
                d.values[i].shift = shift;
                shift += t.x3[i](d.values[i].x1 - d.values[i].x0);
            }
        });
    } else if (system == 2) {  // Diverging stacked bar with inversion
        data.forEach(function(d) {
            var shift = t.width / 2;

            for (var i = 0; i < 3; i++) {
                // first 3 on right
                d.values[i].shift = shift;
                shift += t.x3[i](d.values[i].x1 - d.values[i].x0);
            }

            shift = t.width / 2;

            for (var i = 5; i > 2; i--) {
                // 2nd 3 on left.
                shift -= t.x3[i](d.values[i].x1 - d.values[i].x0);
                d.values[i].shift = shift;
            }
        });
    }

    this.y3.domain(data.map(function(d) { return d.Company; }));

    this.yAxis.scale(this.y3);

    var company = this.svg.selectAll('.company')
        .data(data, function(d) {
            return d.Company;
        });

    company.enter().append("g")
        .attr("class", "g company")
        .attr('id', function(d) { return d.Company; })
        .attr("transform", function(d) { return "translate(0," + t.y3(d.Company) + ")"; });

    company.exit().remove();

    company.selectAll("rect")
        .data(function(d) { return d.values; })
        .enter().append("rect")
        .attr("height", this.y3.rangeBand())
        .attr("x", function(d, i) {
            return d.shift;
        })
        .attr("width", function(d, i) { return t.x3[i](d.x1 - d.x0) })
        .style("fill", function(d) {
            return t.colors(d.name);
        })
        .style('stroke', function(d) {
            if (shouldInvert(system, d.name)) {
                return 'black';
            }
            return t.colors(d.name);
        })
        .style('stroke-width', 2);

    company.on('click', function() {
        answerQuestion(this.id);
    });

    this.yAxis_display.call(this.yAxis);

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

function shouldInvert(system_type, attribute) {
    if ((system_type == 1 || system_type == 2) && invert.indexOf(attribute) > -1)
        return true;
    return false;
}

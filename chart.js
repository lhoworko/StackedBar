var Chart = function(data) {
    this.data = data;

    this.margin3 = {top: 20, right: 30, bottom: 40, left: 50};
    this.width = $('#chart_display').width() - this.margin3.left - this.margin3.right;
    this.height = $('#chart_display').height() - this.margin3.top - this.margin3.bottom;

    var colors = this.colors = d3.scale.category10()
        .domain(d3.keys(data[0]).filter(function(key) { return key !== "Company"; }));

    this.x3 = [];
    for (var i = 0; i < 6; i++) {
        this.x3.push(d3.scale.linear().rangeRound([0, this.width / 6]));
    }

    this.y3 = d3.scale.ordinal()
        .rangeRoundBands([this.height, 0], 0.3);

    this.svg = d3.select("div#chart_display").append("svg")
        .attr("width", this.width + this.margin3.left + this.margin3.right)
        .attr("height", this.height + this.margin3.top + this.margin3.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin3.left + "," + this.margin3.top + ")");

    this.svg.append('defs').append('pattern')
        .attr('id', 'diagonalHatch')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 4)
        .attr('height', 4)
      .append('path')
        .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
        .attr('stroke', '#000000')
        .attr('stroke-width', 1.05);

    this.yAxis = d3.svg.axis()
        .orient("left");

    this.yAxis_display = this.svg.append("g")
        .attr("class", "y axis");

    // Now add the legend.
    var l_width = $('#legend_display').width(),
        l_height = $('#legend_display').height();

    var l_svg = d3.select('div#legend_display').append('svg')
        .attr('width', l_width)
        .attr('height', l_height);

    var legend = l_svg.selectAll(".legend")
        .data(colors.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(5," + (5 + (i * 22)) + ")"; });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colors);

    legend.append("text")
        .attr("x", 21)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) { return d; });

    // Add a vertical line to indicate where the y axis is.
    this.svg.append('path')
        .attr('id', 'midpath');
}

Chart.prototype.updateChart = function(system, task, count) {
    var t = this;

    var data = [
        this.data[count * 2],
        this.data[count * 2 + 1]
    ];

    // Parse and Score the values.
    for (var i = 0; i < 2; i++) {
        data[i].score = {};
        data[i].parsed = {};

        t.colors.domain().forEach(function(attr) {
            // Parse the values.
            // I.e. invert them if needed for later.
            if ((invert.indexOf(attr) > -1) && (system == 1 || system == 2)) {
                data[i].parsed[attr] = data[(i + 1) % 2][attr];
            } else {
                data[i].parsed[attr] = data[i][attr];
            }

            // Score the values.
            // The scores are always assuming less is better for those attributes.
            // Therefore, invert all less is better attributes.
            if (invert.indexOf(attr) > -1) {
                data[i].score[attr] = data[(i + 1) % 2][attr];
            } else {
                data[i].score[attr] = data[i][attr];
            }
        });
    }

    // Figure out the edges of each single attribute.
    // Needed to figure out the correct width.
    data.forEach(function(d) {
        var x0 = 0;
        d.total_score = 0;

        d.values = t.colors.domain().map(function(name) {
            return { name: name, x0: x0, x1: x0 += +d.parsed[name] };
        });
    });

    // Calculate all of the line domains.
    // As well, calculate all of the line scores.
    for (var i = 0; i < 6; i++) {
        t.x3[i].domain([0, d3.max(
            data, function(d) { return d.values[i].x1 - d.values[i].x0; }
        )]);

        for (var j = 0; j < 2; j++) {
            var s = t.x3[i](data[j].score[data[j].values[i].name]);

            data[j].score[data[j].values[i].name] = s;
            data[j].total_score += s;
        }
    }

    if (system == 0 || system == 1) { // Normal stacked bar or with inversion
        data.forEach(function(d) {
            var shift = 0;

            for (var i = 0; i < 6; i++) {
                d.values[i].shift = shift;
                shift += t.x3[i](d.values[i].x1 - d.values[i].x0);
            }
        });

        this.svg.select('#midpath')
            .attr('d', 'M-1 0 V' + this.height);
    } else if (system == 2) {  // Diverging stacked bar with inversion
        data.forEach(function(d) {
            var shift = t.width / 2;

            for (var i = 0; i < 3; i++) { // first 3 on right
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

        this.svg.select('#midpath')
            .attr('d', 'M' + this.width / 2 + ' 0 V' + this.height);
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
        .attr("x", function(d, i) { return d.shift; })
        .attr("width", function(d, i) { return t.x3[i](d.x1 - d.x0) })
        .attr("height", this.y3.rangeBand())
        .style("fill", function(d) { return t.colors(d.name); })
        .each(function(d, i) {
            if (shouldInvert(system, d.name)) {
                d3.select(this.parentNode).append('rect')
                    .attr("x", d.shift)
                    .attr("width", t.x3[i](d.x1 - d.x0))
                    .attr("height", t.y3.rangeBand())
                    .attr('fill', 'url(#diagonalHatch)');
            }
        });

    company.on('click', function() {
        answerQuestion(this.id);
    });

    this.yAxis_display.call(this.yAxis);
}

function shouldInvert(system_type, attribute) {
    if ((system_type == 1 || system_type == 2) && invert.indexOf(attribute) > -1)
        return true;
    return false;
}

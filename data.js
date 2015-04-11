var data;
var data_order;
var invert = ['DGR', 'Debt/Equity', 'Dividend Yield'];

function downloadData(callback) {
    d3.csv('data1.csv', function(d) {
        callback(d);
    });
}

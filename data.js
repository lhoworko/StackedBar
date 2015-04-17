var data;
var data_order;
var invert = ['PEG Ratio', 'PE Ratio', 'EPS% Payout'];

function downloadData(callback) {
    d3.csv('data2.csv', function(d) {
        callback(d);
    });
}

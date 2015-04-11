var data;
var data_order;
var invert = ['DGR', 'Debt/Equity', 'Dividend Yield'];

function downloadData(callback) {
    d3.csv('data1.csv', function(d) {
        callback(d);
    });
}

function getShuffledArray() {
    var array = [];
    var i = 0;

    while(array.push(i++) < (num_systems * num_tasks * rounds_per_task * 2)){}

    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

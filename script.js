var participant_number;
var task_type;
var system_type;
var direction;
var round;
var count;
var total_count;
var status;

var num_systems = 3;
var num_tasks = 3;
var rounds_per_task = 2;
//var stock_order;
var data_order;
var timer;
var chart;

var instructions = [
    "System 0 Instructions",
    "System 1 Instructions",
    "System 2 Instructions"
];

function initParticipant(p) {
    participant_number = p;
    task_type = 0;
    system_type = participant_number % num_systems;
    direction = (participant_number % 2 == 0) ? -1 : 1;
    round = 0;
    count = 0;
    total_count = 0;

    data_order = getShuffledArray();

    downloadData(function() {
        chart = new Chart(data);
    });
}

$(function() {
    $('button#start_btn').click(function() {
        initParticipant(4);
        timer = new Timer();

        $(this).hide();
        $('button#continue_btn').show();
        showInstructions();
    });

    $('button#continue_btn').click(showQuestion);
});

function showInstructions() {
    $('div#instruction_display').text(instructions[system_type]);
    $('div#chart_display').text('');
}

function showQuestion() {
    timer.startTimer();
    // Create and show the chart.
    //var chart = new Chart(task_type, system_type);
    chart.newChart(system_type, task_type, total_count);

    $('button#continue_btn').hide();
}

function answerQuestion(answer) {
    var time = timer.stopTimer();
    //chart.removeChart();
    console.log(time);
    console.log(answer);

    // Destroy Chart.

    $('button#continue_btn').show();

    step();
    showInstructions();
}

/*
 * Return types
 * -1: Everything is done.
 * 0 : Good to continue.
 */
function step() {
    var status = 0;
    round += 1;
    total_count += 1;

    if (round >= rounds_per_task) {
        count += 1;
        if (count >= (num_systems * num_tasks)) {
            status = -1;
        }
        else if (task_type == (num_tasks - 1)) {
            task_type = 0;
            system_type = (system_type + direction) % num_systems;
            if (system_type < 0)
                system_type += num_systems;
        }
        else {
            task_type += 1;
        }
        round = 0;
    }

    if (status == -1) console.log('avg:' + timer.getAvgTime());
}

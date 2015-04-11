var participant_number = 0;

var task_type = 0;
var system_type;

var round = 0;
var total_count = 0;

var num_systems = 3;
var num_tasks = 2;
var rounds_per_task = 1;

var timer;
var chart;

var instructions = [
    "System 0 Instructions",
    "System 1 Instructions",
    "System 2 Instructions"
];

$(function() {
    $('button#start_btn').click(function() {
        system_type = participant_number % num_systems;
        timer = new Timer();

        downloadData(function(data) {
            chart = new Chart(data);
        });

        $(this).hide();
        $('button#continue_btn').show();
        showInstructions();
    });

    $('button#continue_btn').click(showQuestion);
});

function showInstructions() {
    $('div#instruction_display').text(instructions[system_type]);
    $('div#chart_display').hide();
}

function showQuestion() {
    timer.startTimer();

    // Create and show the chart.
    $('div#chart_display').show();
    chart.updateChart(system_type, task_type, total_count);

    $('button#continue_btn').hide();
}

function answerQuestion(answer) {
    timer.stopTimer();
    console.log(answer);

    var s = step();
    if (s == -1) {
        // Done.
        $('div#chart_display').text('');
        console.log(timer.getAvgTime());
    } else {
        $('button#continue_btn').show();
        showInstructions();
    }
}

/*
 * Return types
 * -1: Everything is done.
 * 0 : Good to continue.
 */
function step() {
    round = ((round + 1) % rounds_per_task);
    total_count += 1;

    if (total_count >= (num_systems * num_tasks * rounds_per_task)) {
        return -1;
    }

    if (round == 0) {
        task_type = ((task_type + 1) % num_tasks);
        if (task_type == 0) {
            system_type = ((system_type + 1) % num_systems);
        }
    }

    return 0;
}

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
var results;

var instructions = [
    "System 0 Instructions",
    "System 1 Instructions",
    "System 2 Instructions"
];

$(function() {
    $('button#start_btn').click(function() {
        system_type = participant_number % num_systems;
        timer = new Timer();
        initResults();

        downloadData(function(data) {
            chart = new Chart(data);
        });

        $(this).hide();
        $('button#continue_btn').show();
        showInstructions();
    });

    $('button#continue_btn').click(showQuestion);
});

function initResults() {
    results = [];
    for (var i = 0; i < num_systems; i++) {
        results.push([]);

        for (var j = 0; j < num_tasks; j++) {
            results[i].push([]);
        }
    }
}

function newResult(system, task, correct, time) {
    results[system][task].push({
        "correct": correct,
        "time": time
    });
}

function showInstructions() {
    $('div#instruction_display').text(instructions[system_type]);
    $('div#chart_display svg').hide();
}

function showQuestion() {
    timer.startTimer();

    // Create and show the chart.
    $('div#chart_display svg').show();
    chart.updateChart(system_type, task_type, total_count);

    $('button#continue_btn').hide();
}

function answerQuestion(answer) {
    var time = timer.stopTimer();
    var correct = answer;
    //var correct = false;

    newResult(system_type, task_type, correct, time);

    var s = step();
    if (s == -1) { // Done.
        $('div#chart_display').text('');
        console.log(timer.getAvgTime());
        console.log(results);
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

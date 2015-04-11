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

var timers = [];

function initParticipant(participant_number) {
    system_type = participant_number % num_systems;

    downloadData(function() {
        chart = new Chart(data);
    });
}

function initTimers() {
    for (var i = 0; i < num_systems; i++) {
        timers[i] = [];
        for (var j = 0; j < num_tasks; j++) {
            timers[i][j] = new Timer();
        }
    }
}

function printTimers() {
    $('div#chart_display').text('');
    for (var i = 0; i < num_systems; i++) {
        for (var j = 0; j < num_tasks; j++) {
            console.log('timer ' + i + ' ' + j + ': ' + timers[i][j].getAvgTime());
        }
     }
}

$(function() {
    $('button#start_btn').click(function() {
        initParticipant(4);
        initTimers();
        //initChart();

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
    timers[system_type][task_type].startTimer();

    // Create and show the chart.
    chart.newChart(system_type, task_type, total_count);

    $('button#continue_btn').hide();
}

function answerQuestion(answer) {
    timers[system_type][task_type].stopTimer();
    console.log(answer);

    var s = step();
    if (s == -1) {
        // Done.
        $('div#chart_display').text('');
        printTimers();
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

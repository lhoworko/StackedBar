var participant_number = 2;

var task_type = 0;
var system_type;

var round = -1;
var total_count = 0;

var NUM_SYSTEMS = 3;
var NUM_TASKS = 2;
var ROUNDS_PER_TASK = 1;

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
        system_type = participant_number % NUM_SYSTEMS;
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
    for (var i = 0; i < NUM_SYSTEMS; i++) {
        results.push([]);

        for (var j = 0; j < NUM_TASKS; j++) {
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

    if (round == -1) { // Practice round
        chart.updateChart(system_type, task_type, (
            (NUM_SYSTEMS * NUM_TASKS * ROUNDS_PER_TASK) +
            ((2 * system_type) + task_type)
        ));
    } else {
        chart.updateChart(system_type, task_type, total_count);
    }

    $('button#continue_btn').hide();
}

function answerQuestion(answer) {
    var time = timer.stopTimer();
    var correct = answer;
    var s;

    if (round == -1) { // Practice round
        // If the answer is correct, continue.
        // If wrong, tell them why and show the question again.

        //if (answer is correct) {
             s = step();
        //} else {
            //console.log('wrong');
            // Show instructions how to answer correctly.
        //}
    } else {
        newResult(system_type, task_type, correct, time);
        s = step();
    }
    console.log(chart.data);

    if (s == -1) { // Done.
        $('div#chart_display').text('');
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
    round += 1;

    if (round != 0) {
        // Not coming out of a practice round

        total_count += 1;
        if (total_count >= (NUM_SYSTEMS * NUM_TASKS * ROUNDS_PER_TASK)) {
            return -1;
        }

        if (round == ROUNDS_PER_TASK) {
            // Going in to practice round
            round = -1;

            task_type = ((task_type + 1) % NUM_TASKS);
            if (task_type == 0) {
                system_type = ((system_type + 1) % NUM_SYSTEMS);
            }
        }
    }

    return 0;
}

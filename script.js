var participant_number;
var task_type;
var system_type;
var direction;
var round;
var count;
var status;

var rounds_per_task = 1;
var instructions = [
    "System 0 Instructions",
    "System 1 Instructions",
    "System 2 Instructions"
];

var timer;

function initParticipant(p) {
    participant_number = p;
    task_type = 0;
    system_type = participant_number % 3;
    direction = (participant_number % 2 == 0) ? -1 : 1;
    round = 0;
    count = 0;
}

$(function() {
    $('button#start_btn').click(function() {
        initParticipant(4);
        timer = new Timer();

        $(this).hide();
        $('button#continue_btn').show();
        showInstructions();
    });

    $('button#continue_btn').click(function() {
        //$('div#chart_display').text('TASK ' + task_type);
        showQuestion();
        timer.startTimer();
        // show chart
    });

    d3.select('svg').on('answer', function(d) {
        console.log(d);
    });
});

function showInstructions() {
    $('div#instruction_display').text(instructions[system_type]);
    $('div#chart_display').text('');
}

function showQuestion() {
    // Create and show the chart.
    var chart = new Chart(task_type, system_type);

    $('button#continue_btn').hide();
}

function answerQuestion(answer) {
    var time = timer.stopTimer();
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

    if (round >= rounds_per_task) {
        count += 1;
        if (count >= 9) {
            status = -1;
        }
        else if (task_type == 2) {
            task_type = 0;
            system_type = (system_type + direction) % 3;
            if (system_type < 0)
                system_type += 3;
        }
        else {
            task_type += 1;
        }
        round = 0;
    }

    if (status == -1) console.log('avg:' + timer.getAvgTime());
}

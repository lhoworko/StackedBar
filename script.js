var participant_number;
var task_type;
var system_type;
var direction;
var round;
var count;
var status;

var rounds_per_task = 1;
var instructions = [
    "Task 0 Instructions",
    "Task 1 Instructions",
    "Task 2 Instructions"
];

$(function() {
    $('button#start_btn').click(function() {
        initParticipant(4);
        $(this).hide();
        $('button#continue_btn').show();
        showInstructions();
    });

    $('button#continue_btn').click(function() {
        $('div#chart_display').text('TASK ' + task_type);
        showAnswers();
    });

    $('button.answer').click(clickAnswer);
});

function clickAnswer() {
    hideAnswers();
    step();
    showInstructions();
}

function showInstructions() {
    $('div#instruction_display').text(instructions[system_type]);
    $('div#chart_display').text('');
}

function showAnswers() {
    $('button#continue_btn').hide();
    $('button#answerA_btn').show();
    $('button#answerB_btn').show();
}

function hideAnswers() {
    $('button#continue_btn').show();
    $('button#answerA_btn').hide();
    $('button#answerB_btn').hide();
}

function step() {
    status = advanceTypes();
    if (status == -1) console.log('done');
}

function initParticipant(p) {
    participant_number = p;
    task_type = 0;
    system_type = participant_number % 3;
    direction = (participant_number % 2 == 0) ? -1 : 1;
    round = 0;
    count = 0;
    disabled = true;
}

/*
 * Return types
 * -1: Everything is done.
 * 0 : Good to continue.
 */
function advanceTypes() {
    var status = 0;
    round += 1;

    if (round >= rounds_per_task) {
        count += 1;
        if (count >= 9) {
            return -1;
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

    return 0;
}
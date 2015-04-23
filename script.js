var participant_number;
var group_number;

var NUM_SYSTEMS = 3;
var NUM_TASKS = 2;
var ROUNDS_PER_TASK = 5;

// Don't change these values START

var timer;
var chart;
var results;
var tar_attr = 'PE Ratio';

var task_type = 0;
var system_type;

var round = -1;
var total_count = 0;

// END

$(function() {
    $('button#start_btn').click(function() {
        participant_number = $('input#part_num').val();
        group_number = $('input#group_num').val();
        system_type = group_number - 1;

        if ($('input#part_num').val() == '' || $('input#group_num').val() == '' ||
                isNaN(participant_number) || isNaN(system_type)) {
            console.log('Must enter a number');
            return false;
        }

        if (system_type < 0 || system_type > 2) {
            console.log('Group number must be between 1 and 3');
            return false;
        }

        timer = new Timer();
        initResults();

        downloadData(function(data) {
            chart = new Chart(data);
        });

        $('div#start_info').hide();
        $('button#continue_btn').show();
        setInstructions(system_type, task_type);
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

function getPrintableResults() {
    var part_data = participant_number + ',' + group_number;
    var s = '';

    for (var i = 0; i < NUM_SYSTEMS; i++) {
        for (var j = 0; j < NUM_TASKS; j++) {
            for (var k = 0; k < ROUNDS_PER_TASK; k++) {
                s += [part_data, i, j, k, +results[i][j][k].correct, results[i][j][k].time].join(',') + '\n';
            }
        }
    }

    return s;
}

function setInstructions(system, task) {
    var inst;

    if (round == -1) {
        inst = "[Practice Round] - ";
    } else {
        inst = "[Round " + (round + 1) + " of " + ROUNDS_PER_TASK + "] - ";
    }

    switch (task) {
        case 0:
            inst += "Single Attribute Comparison. Select the stock that has a lower " + tar_attr + ". ";
            break;
        case 1:
            inst += "Overall Comparison. Assuming that each attribute has an equal weight, select the best overall stock. ";
            break;
    }

    switch (system) {
        case 0:
            inst += "Note that PE, PEG, and EPS% are all lower is better, while Dividend Yield, ROE, and NY% Growth are all higher is better.";
            break;
        case 1:
        case 2:
            inst += "Note that the lower is better attributes, PE, PEG, and EPS% have all been inverted to become higher is better. The other 3 attributes are also higher is better.";
            break;
    }

    $('div#instruction_display').text(inst);
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
    var s;
    var correct_answer;

    $('div#chart_display svg').hide();
    $('button#continue_btn').show();

    if (round == -1) { // Practice round
        correct_answer = getCorrectAnswer(task_type, (
            (NUM_SYSTEMS * NUM_TASKS * ROUNDS_PER_TASK) +
            ((2 * system_type) + task_type)
        ));

        // If the answer is correct, continue.
        // If wrong, tell them why and show the question again.
        if (answer == correct_answer) {
             s = step();

        } else {
            // Show instructions how to answer correctly.
            console.log('wrong');
            $('div#chart_display svg').show();
            $('button#continue_btn').hide();
        }
    } else {
        correct_answer = getCorrectAnswer(task_type, total_count);
        newResult(system_type, task_type, answer == correct_answer, time);
        s = step();
    }

    if (s == -1) { // Done.
        navigator.webkitPersistentStorage.requestQuota(1024 * 1024,
            function(grantedBytes) {
                window.webkitRequestFileSystem(PERSISTENT, grantedBytes, onInitFs);
            }, function(e) {
                console.log('Error', e);
            }
        );

        $('button#continue_btn').hide();
    } else {
        setInstructions(system_type, task_type);
    }
}

function onInitFs(fs) {
    fs.root.getFile('results.csv', {create: true}, function(fileEntry) {

        // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function(fileWriter) {
            fileWriter.seek(fileWriter.length);

            var blob = new Blob([getPrintableResults()], {type: 'text/plain'});
            fileWriter.write(blob);
        });
    });
}

function getCorrectAnswer(task, count) {
    if (task == 0) { // Lowest DEG
        if (chart.data[count * 2].score[tar_attr] >
                chart.data[count * 2 + 1].score[tar_attr]) {
            return chart.data[count * 2].Company;
        } else {
            return chart.data[count * 2 + 1].Company;
        }
    } else { // Highest Overall
        if (chart.data[count * 2].total_score >
                chart.data[count * 2 + 1].total_score) {
            return chart.data[count * 2].Company;
        } else {
            return chart.data[count * 2 + 1].Company;
        }
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

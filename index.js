const readline = require('readline')
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const keypress = require('keypress');

const ac = new AbortController();

let taskList = [];
let navigator = taskListNavigator(taskList)

let canRefresh = true;
let refreshPrint

keypress(process.stdin);
    // Key is pressed
process.stdin.on('keypress', function (ch, key) {
    if(key?.name == 'up') {
        navigator.arrowUp();
    }
    if(key?.name == 'down') {
        navigator.arrowDown();
    }
    if(key?.name == 'space' && canRefresh) {
        navigator.confirm();
    }
    if(key?.name == 'escape') {
        navigator.end();
    }
    // Para de refrescarse cuando pulsas una tecla diferente a las que aparecen
    // Se refresca cuando pulsas una de las teclas que aparecen
    canRefresh = key?.name == 'up' || key?.name == 'down' || (canRefresh && key?.name == 'space') || key?.name == 'return';

    if (!canRefresh && refreshPrint) clearTimeout(refreshPrint);
    if (key?.name == 'return') createTaskList(taskList);

});

createTaskList(taskList);

function addTask(taskList, taskDescription) {
    taskList.push({done: false, selected: false, description: taskDescription});
}

function printTaskList(taskList, priorityTaskDone = false) {
    for ([number, task] of taskList.entries()) {
        if (task.done && task.selected && canRefresh) {
            console.log(number + 1 + `. [${priorityTaskDone ? 'x' : '*'}]`, task.description);
            refreshPrint = setTimeout( () => {
                createTaskList(taskList, !priorityTaskDone);
            }, 500);
        } else if (task.selected) {
            console.log(number + 1 + '. [*]', task.description);
        } else if (task.done) {
            console.log(number + 1 + '. [x]', task.description);
        } else {
            console.log(number + 1 + '. [ ]', task.description);
        }
    }
}

function changeTaskStatus(taskList, index) {
    if (index >= 0 && index < taskList.length) {
        taskList[index].done = !taskList[index].done;
    } else {
        console.log('Invalid task number');
    }
}

function checkAllDone(taskList) {
    for (const task of taskList) {
        if (!task.done) return false;
    }
    return true;
}

// let taskNavigator = (function(taskList) {
//     let taskNumber = 0

//     return {
//         arrowUp: function() {
//             console.log(taskList);
//         },
//         arrowDown: function() {
//             console.log("arrowDown");
            
//         },
//         confirm: function() {
//             console.log("confirmed");
//         }
//     }
// })(taskList);

// taskNavigator.arrowUp()


function taskListNavigator(taskList) {
    let taskNumber = 0;

    function refresh(number) {
        for (const index in taskList) {
            taskList[index].selected = index == number - 1;
        }
    }

    return {
        arrowUp: function() {
            if(taskNumber > 1) {
                taskNumber--;
                refresh(taskNumber);
                console.clear();
                createTaskList(taskList);
            }
        },
        arrowDown: function() {
            if(taskNumber < taskList.length) {
                taskNumber++;
                refresh(taskNumber);
                console.clear();
                createTaskList(taskList);
            }
            
        },
        confirm: function() {
            changeTaskStatus(taskList, taskNumber - 1)
            refresh(taskNumber);
            createTaskList(taskList, true);
        },
        end: function() {
            rl.close();
        }
    }
};

function createTaskList(taskList, priorityTaskDone = false) {
    console.clear();
    if(taskList.length > 0) {
        console.log('Pulsa ↑ o ↓ para navegar por la lista y ESPACIO para seleccionar: ');
    }
    printTaskList(taskList, priorityTaskDone);
    rl.question('Introduce una nueva tarea o pulsa ESC para salir: ', taskDescription => {
        addTask(taskList, taskDescription);
        createTaskList(taskList);
    });
}
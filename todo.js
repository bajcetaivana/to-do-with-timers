function observable() {
    let state;
    const subscribers = [];
    function set(val) {
        state = val;
        for (const cb of subscribers) {
            cb(val);
        }
    }

    function subscribe(cb) {
        subscribers.push(cb);
    }

    function get() {
        return state;
    }

    return {
        set,
        subscribe,
        get,
    }
}

const count = observable();
count.subscribe((val) => console.log("todos: " + val));
count.subscribe((val) => document.getElementById("count").textContent = val);
count.set(0);

const timers = [];
let intervalNodeMap = {};
const elapsedTimes = {}; // Store elapsed times for each timer

const input = document.getElementById("newtodo");
const button = document.getElementById("addButton");

function updateAddButtonState() {
    if (input.value.length > 0) {
        button.removeAttribute("disabled");
    } else {
        button.setAttribute("disabled", "");
    }
}

input.addEventListener('input', updateAddButtonState);

function add() {
    const text = document.getElementById("newtodo").value;
    const node = document.createElement("li");
    node.classList.add("todo-li");
    node.id = count.get();
    const itemTitle = document.createElement("p");
    itemTitle.classList.add("todo-title");
    itemTitle.textContent = text;
    node.appendChild(itemTitle);
    document.getElementById("todolist").appendChild(node);
    addStartStopButtons(node);
    count.set(count.get() + 1);
    input.value = '';
    updateAddButtonState();
}

function addStartStopButtons(node) {
    let elapsedTime = 0;
    let startTime = null;

    const buttonStartNode = document.createElement("button");
    buttonStartNode.textContent = "Start";
    buttonStartNode.id = "start" + node.id;
    buttonStartNode.classList.add("todo-button-start");

    const buttonStopNode = document.createElement("button");
    buttonStopNode.textContent = "Stop";
    buttonStopNode.id = "stop" + node.id;
    buttonStopNode.classList.add("todo-button-stop");
    buttonStopNode.setAttribute('disabled', '');

    node.appendChild(buttonStartNode);
    node.appendChild(buttonStopNode);

    buttonStartNode.addEventListener('click', function () {
        stopAllTimers();
        buttonStartNode.setAttribute('disabled', '');
        buttonStopNode.removeAttribute('disabled');
        disableOtherStopButtons(node.id);
        enableOtherStartButtons(node.id);
        startTime = new Date();
        elapsedTime = elapsedTimes[node.id] || 0; // Use previously recorded elapsed time
        intervalNodeMap[node.id] = startTimer(node, elapsedTime, startTime);
    });

    buttonStopNode.addEventListener('click', function () {
        stopTimer(node.id);
        buttonStartNode.removeAttribute('disabled');
        buttonStopNode.setAttribute('disabled', '');
    });

    function stopAllTimers() {
        for (const id in intervalNodeMap) {
            if (intervalNodeMap[id] !== null) {
                stopTimer(id);
            }
        }
    }

    function stopTimer(id) {
        if (intervalNodeMap[id] && intervalNodeMap[id].interval) {
            clearInterval(intervalNodeMap[id].interval);
            const now = new Date();
            if (!elapsedTimes[id]) {
                elapsedTimes[id] = 0;
            }
            // Calculate the elapsed time including the time between start and stop
            const additionalTime = now - intervalNodeMap[id].startTime;
            elapsedTimes[id] += additionalTime;
            intervalNodeMap[id] = null;
        }
    }

    function disableOtherStopButtons(currentId) {
        const allStartButtons = document.querySelectorAll(".todo-button-stop");
        allStartButtons.forEach(button => {
            if (button.id !== "stop" + currentId) {
                button.setAttribute('disabled', '');
            }
        });
    }

    function enableOtherStartButtons(currentId) {
        const allStartButtons = document.querySelectorAll(".todo-button-start");
        allStartButtons.forEach(button => {
            if (button.id !== "start" + currentId) {
                button.removeAttribute('disabled');
            }
        });
    }
}

function startTimer(node, elapsedTime, startTime) {
    const idValue = node.id + "_time";
    let timer;
    if (!document.getElementById(idValue)) {
        timer = document.createElement("button");
        timer.id = idValue;
        node.appendChild(timer);
    } else {
        timer = document.getElementById(idValue);
    }

    function updateTime() {
        const now = new Date();
        const elapsed = now - startTime; // Calculate elapsed time based on current time and start time
        const currentElapsedTime = elapsed + elapsedTime; // Include previously recorded elapsed time
        timers[node.id] = currentElapsedTime;
        const sum = sumOfTimers();
        document.getElementById('totalTimeSpent').textContent = sum;
        timer.textContent = 'Time: ' + formattedTime(currentElapsedTime);
    }

    const interval = {
        interval: setInterval(updateTime, 1000),
        startTime: startTime
    };

    updateTime();
    return interval;
}

function formattedTime(currentElapsedTime) {
    const hours = Math.floor(currentElapsedTime / (1000 * 60 * 60));
    const minutes = Math.floor((currentElapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((currentElapsedTime % (1000 * 60)) / 1000);
    return (
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0')
    );
}

function sumOfTimers() {
    let sumOfTimes = 0;
    for (const timer of timers) {
        if (timer) {
            sumOfTimes += timer;
        }
    }
    return formattedTime(sumOfTimes);
}
